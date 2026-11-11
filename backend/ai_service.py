import re
import json
import ssl
import logging
from typing import List, Dict, Any, Optional
import httpx

from config import settings
import models
import schemas

logger = logging.getLogger(__name__)

def get_ssl_context():
    """
    Returns an SSL context with verified CA certificates.
    Loads OS / system root certificates so Windows/enterprise stores are properly validated.
    """
    try:
        ctx = ssl.create_default_context()
        ctx.load_default_certs()
        return ctx
    except Exception as e:
        logger.warning(f"Could not load OS default certificates for SSL verification: {e}")
        return True

STOP_WORDS = {
    "a", "an", "the", "in", "on", "at", "for", "to", "of", "and", "or", "is", 
    "are", "was", "were", "i", "want", "find", "suggest", "recommend", "show", 
    "me", "some", "good", "best", "give", "please", "books", "book", "library"
}

CATEGORY_SYNONYMS = {
    "computer science": ["python", "programming", "code", "coding", "software", "developer", "web", "algorithm", "data", "ai", "machine learning"],
    "self-help & personal development": ["motivational", "motivation", "student", "students", "habit", "habits", "success", "mindset", "focus", "discipline", "productivity", "life", "inspiration"],
    "children's literature": ["children", "child", "kids", "kid", "bedtime", "story", "stories", "easy english", "junior", "fairy tale"],
    "science & nature": ["science", "physics", "universe", "space", "cosmos", "biology", "chemistry", "nature", "earth", "scientific"],
    "fantasy & adventure": ["harry potter", "magic", "wizard", "fantasy", "adventure", "potter", "quest", "dragons", "mythology", "sorcery"],
    "fiction & classics": ["fiction", "novel", "classic", "literature", "drama", "story"],
    "history & biography": ["history", "biography", "historical", "war", "world war", "civilization", "leader", "memoir"]
}

AUDIENCE_KEYWORDS = {
    "beginner": ["beginner", "beginners", "starter", "intro", "introduction", "basics", "fundamental", "friendly", "easy"],
    "student": ["student", "students", "college", "school", "exam", "study"],
    "children": ["children", "kids", "kid", "child", "elementary", "toddler"],
    "advanced": ["advanced", "expert", "deep", "mastery", "professional"]
}

def clean_tokens(text: str) -> List[str]:
    words = re.findall(r'\b[a-zA-Z0-9_\-]+\b', text.lower())
    return [w for w in words if w not in STOP_WORDS and len(w) > 1]

def match_query_with_fallback(
    query_text: str,
    books: List[models.Book],
    category_filter: Optional[str] = None,
    language_filter: Optional[str] = None,
    only_available: bool = False
) -> schemas.AISearchResult:
    """
    Intelligent weighted catalog ranking with NLP intent extraction.
    Ensures 100% catalog adherence with zero hallucination.
    """
    query_lower = query_text.lower().strip()
    tokens = clean_tokens(query_text)
    
    # Identify intents
    detected_categories = []
    for cat, keywords in CATEGORY_SYNONYMS.items():
        if any(kw in query_lower for kw in keywords):
            detected_categories.append(cat)
            
    detected_audience = []
    for aud, keywords in AUDIENCE_KEYWORDS.items():
        if any(kw in query_lower for kw in keywords):
            detected_audience.append(aud)

    # Build human-readable intent description
    intent_parts = []
    if detected_audience:
        intent_parts.append(f"{', '.join(detected_audience).title()}-oriented")
    if detected_categories:
        intent_parts.append(f"topics matching '{', '.join(detected_categories).title()}'")
    if not intent_parts:
        intent_parts.append(f"catalog search for '{query_text}'")
        
    understood_intent = f"Identified interest in {' '.join(intent_parts)}."
    
    scored_items = []

    for book in books:
        if not book.is_active:
            continue
        if category_filter and category_filter.lower() not in book.category.lower():
            continue
        if language_filter and language_filter.lower() != book.language.lower():
            continue
        if only_available and book.available_copies <= 0:
            continue

        score = 0.0
        match_reasons = []

        b_title_lower = book.title.lower()
        b_author_lower = book.author.lower()
        b_cat_lower = book.category.lower()
        b_desc_lower = book.description.lower()
        b_tags_lower = (book.tags or "").lower()

        # Direct phrase match
        if query_lower in b_title_lower:
            score += 60.0
            match_reasons.append("exact title match")
        elif any(token in b_title_lower for token in tokens):
            score += 35.0
            match_reasons.append("title keyword match")

        # Author match
        if query_lower in b_author_lower or any(token in b_author_lower for token in tokens if len(token) > 3):
            score += 30.0
            match_reasons.append(f"authored by {book.author}")

        # Category match
        for dcat in detected_categories:
            if dcat in b_cat_lower:
                score += 30.0
                match_reasons.append(f"belongs to the '{book.category}' category")
                break

        # Tags match
        matched_tags = [t for t in tokens if t in b_tags_lower]
        if matched_tags:
            score += 15.0 * len(matched_tags)
            match_reasons.append(f"relevant tags ({', '.join(matched_tags[:3])})")

        # Description keyword overlap
        desc_matches = [t for t in tokens if t in b_desc_lower]
        if desc_matches:
            score += min(len(desc_matches) * 5.0, 25.0)
            if not match_reasons:
                match_reasons.append("overview aligns with your request")

        # Audience match
        for aud in detected_audience:
            if any(k in b_desc_lower or k in b_tags_lower for k in AUDIENCE_KEYWORDS[aud]):
                score += 15.0
                match_reasons.append(f"suited for {aud} level")

        # Availability boost
        if book.available_copies > 0:
            score += 5.0

        if score > 0 or len(tokens) == 0:
            reason_text = "Recommended because " + (", ".join(match_reasons) if match_reasons else "it matches library catalog criteria.")
            scored_items.append({
                "book": book,
                "score": score,
                "reason": reason_text,
                "is_similar_alternative": False
            })

    # Sort descending by score
    scored_items.sort(key=lambda x: x["score"], reverse=True)

    # Check if top results have unavailable books, offer similar available alternatives
    results = []
    for item in scored_items[:12]:
        b = item["book"]
        book_resp = schemas.BookResponse.model_validate(b)
        results.append(schemas.BookRecommendationItem(
            book=book_resp,
            match_score=round(item["score"], 1),
            recommendation_reason=item["reason"],
            is_similar_alternative=False
        ))

        # If book is currently unavailable, find an alternative from same category
        if b.available_copies == 0:
            alt_candidates = [
                alt for alt in books 
                if alt.id != b.id 
                and alt.category == b.category 
                and alt.available_copies > 0 
                and alt.is_active
            ]
            if alt_candidates:
                alt_book = alt_candidates[0]
                alt_resp = schemas.BookResponse.model_validate(alt_book)
                results.append(schemas.BookRecommendationItem(
                    book=alt_resp,
                    match_score=round(item["score"] * 0.85, 1),
                    recommendation_reason=f"Available alternative in '{b.category}' while '{b.title}' is currently on loan.",
                    is_similar_alternative=True
                ))

    return schemas.AISearchResult(
        query=query_text,
        understood_intent=understood_intent,
        total_matches=len(results),
        results=results,
        ai_powered=False
    )

async def search_books_with_ai(
    query_text: str,
    books: List[models.Book],
    category_filter: Optional[str] = None,
    language_filter: Optional[str] = None,
    only_available: bool = False
) -> schemas.AISearchResult:
    """
    Attempts to call Gemini API if key is present; otherwise gracefully falls back
    to the high-accuracy intelligent local NLP engine.
    """
    if not settings.GEMINI_API_KEY:
        return match_query_with_fallback(query_text, books, category_filter, language_filter, only_available)

    # If GEMINI_API_KEY is configured, try querying Gemini
    try:
        catalog_sample = [
            {
                "id": b.id,
                "title": b.title,
                "author": b.author,
                "category": b.category,
                "tags": b.tags,
                "available": b.available_copies > 0,
                "copies": b.available_copies,
                "summary": b.description[:180]
            }
            for b in books if b.is_active
        ]

        system_prompt = (
            "You are LibraryEase AI Book Discovery Assistant. Analyze user's book query and select the most relevant "
            "books from this provided database catalog only. DO NOT hallucinate books that are not in the list. "
            "Return JSON format with: 'understood_intent' (string), and 'ranked_ids' (array of objects with 'id', 'score' 1-100, and 'reason' why recommended)."
        )

        user_content = f"User Query: '{query_text}'.\nCatalog:\n{json.dumps(catalog_sample[:30])}"

        payload = {
            "contents": [
                {"role": "user", "parts": [{"text": f"{system_prompt}\n\n{user_content}"}]}
            ],
            "generationConfig": {"response_mime_type": "application/json"}
        }

        candidate_models = ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-3.8-flash"]
        async with httpx.AsyncClient(timeout=10.0, verify=get_ssl_context()) as client:
            for model_name in candidate_models:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={settings.GEMINI_API_KEY}"
                try:
                    resp = await client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        text_out = data["candidates"][0]["content"]["parts"][0]["text"]
                        parsed = json.loads(text_out)

                        book_map = {b.id: b for b in books}
                        results = []
                        for item in parsed.get("ranked_ids", []):
                            b_id = item.get("id")
                            if b_id in book_map:
                                book_obj = book_map[b_id]
                                if category_filter and category_filter.lower() not in book_obj.category.lower():
                                    continue
                                if language_filter and language_filter.lower() != book_obj.language.lower():
                                    continue
                                if only_available and book_obj.available_copies <= 0:
                                    continue

                                results.append(schemas.BookRecommendationItem(
                                    book=schemas.BookResponse.model_validate(book_obj),
                                    match_score=float(item.get("score", 85)),
                                    recommendation_reason=item.get("reason", "Curated by AI to match your reading preferences."),
                                    is_similar_alternative=False
                                ))

                        return schemas.AISearchResult(
                            query=query_text,
                            understood_intent=parsed.get("understood_intent", f"AI recommendation for: '{query_text}'"),
                            total_matches=len(results),
                            results=results,
                            ai_powered=True
                        )
                except Exception as model_err:
                    logger.debug(f"Candidate model {model_name} failed: {model_err}")
                    continue
    except Exception as e:
        logger.warning(f"Gemini API invocation fallback to local NLP engine: {e}")

    # Seamless fallback
    return match_query_with_fallback(query_text, books, category_filter, language_filter, only_available)

async def chat_with_ai(
    chat_request: schemas.AIChatRequest,
    books: List[models.Book]
) -> schemas.AIChatResponse:
    """
    Conversational AI Assistant handler:
    - If GEMINI_API_KEY is configured: Queries Gemini 1.5 Flash with the full catalog.
    - If GEMINI_API_KEY is not configured: Operates in transparent Rule-Based Demo Mode
      with conversational responses and high-accuracy book matching.
    """
    from datetime import datetime
    now_iso = datetime.utcnow().isoformat()
    msg_clean = chat_request.message.strip()
    msg_lower = msg_clean.lower()

    # Common conversational greetings & library FAQs in rule-based mode
    GREETING_PATTERNS = ["hello", "hi", "hey", "good morning", "good evening", "greetings", "namaste", "who are you", "what can you do"]
    is_greeting = any(re.search(rf"\b{re.escape(g)}\b", msg_lower) for g in GREETING_PATTERNS)

    if is_greeting and len(clean_tokens(msg_clean)) <= 2:
        return schemas.AIChatResponse(
            reply=(
                "Greetings, dear reader! I am your LibraryEase AI Literary Concierge. "
                "I can guide your reading journey, recommend books matching your mood or topic, "
                "locate shelf positions in our Mumbai branches, and answer questions about our collections. "
                "What genre, atmosphere, or subject calls to you today?"
            ),
            understood_intent="Greeting and discovery inquiry",
            recommendations=[],
            mode="demo_rule_based" if not settings.GEMINI_API_KEY else "gemini_ai",
            ai_powered=bool(settings.GEMINI_API_KEY),
            timestamp=now_iso
        )

    # If GEMINI_API_KEY is configured, attempt Live Gemini Call
    if settings.GEMINI_API_KEY:
        try:
            catalog_summary = [
                {
                    "id": b.id,
                    "title": b.title,
                    "author": b.author,
                    "category": b.category,
                    "tags": b.tags,
                    "available": b.available_copies > 0,
                    "shelf": b.shelf_location,
                    "summary": b.description[:200]
                }
                for b in books if b.is_active
            ]

            system_instruction = (
                "You are the LibraryEase AI Literary Concierge. Your tone is refined, welcoming, and knowledgeable "
                "(a sophisticated vintage library aesthetic). You assist readers by discussing books, authors, and themes, "
                "and recommending titles strictly from the provided library catalog. Never fabricate books not in the catalog. "
                "Return a strict JSON object with these keys:\n"
                "- 'reply': string (your conversational, natural response to the user)\n"
                "- 'understood_intent': string (brief summary of what the user is looking for)\n"
                "- 'recommended_book_ids': list of integers (IDs of books from catalog you recommend, max 4)\n"
            )

            # Build conversation history
            contents = []
            for h in (chat_request.history or [])[-6:]:
                role_label = "user" if h.role == "user" else "model"
                contents.append({"role": role_label, "parts": [{"text": h.content}]})

            user_query_payload = (
                f"{system_instruction}\n\n"
                f"Available Library Catalog:\n{json.dumps(catalog_summary[:35])}\n\n"
                f"User Message: {msg_clean}"
            )
            contents.append({"role": "user", "parts": [{"text": user_query_payload}]})

            payload = {
                "contents": contents,
                "generationConfig": {"response_mime_type": "application/json", "temperature": 0.4}
            }

            candidate_models = ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-3.8-flash"]
            async with httpx.AsyncClient(timeout=12.0, verify=get_ssl_context()) as client:
                for model_name in candidate_models:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={settings.GEMINI_API_KEY}"
                    try:
                        resp = await client.post(url, json=payload)
                        if resp.status_code == 200:
                            data = resp.json()
                            text_out = data["candidates"][0]["content"]["parts"][0]["text"]
                            parsed = json.loads(text_out)

                            book_map = {b.id: b for b in books}
                            recommendations = []
                            for b_id in parsed.get("recommended_book_ids", []):
                                if b_id in book_map:
                                    b_obj = book_map[b_id]
                                    recommendations.append(schemas.BookRecommendationItem(
                                        book=schemas.BookResponse.model_validate(b_obj),
                                        match_score=94.0,
                                        recommendation_reason="Curated by Gemini AI to match your conversational inquiry.",
                                        is_similar_alternative=False
                                    ))

                            return schemas.AIChatResponse(
                                reply=parsed.get("reply", "Here are my literary recommendations from our library stacks:"),
                                understood_intent=parsed.get("understood_intent", f"Inquiry for: '{msg_clean}'"),
                                recommendations=recommendations,
                                mode="gemini_ai",
                                ai_powered=True,
                                timestamp=now_iso
                            )
                    except Exception as model_err:
                        logger.debug(f"Candidate model {model_name} failed: {model_err}")
                        continue
        except Exception as e:
            logger.warning(f"Gemini AI chat invocation failed, falling back to rule-based demo: {e}")

    # Rule-Based Intelligent Catalog Recommendations (Demo Mode)
    fallback_res = match_query_with_fallback(
        query_text=msg_clean,
        books=books,
        category_filter=chat_request.category,
        language_filter=None,
        only_available=False
    )

    top_recs = fallback_res.results[:3]

    if top_recs:
        book_names = [f"'{r.book.title}' by {r.book.author}" for r in top_recs]
        if len(book_names) == 1:
            titles_str = book_names[0]
        else:
            titles_str = ", ".join(book_names[:-1]) + f", and {book_names[-1]}"

        reply_text = (
            f"I've explored our library holdings regarding \"{msg_clean}\" and found {len(top_recs)} compelling works. "
            f"I particularly recommend {titles_str}. "
            "You can examine their detailed synopses, shelf locations, and borrow them directly below."
        )
    else:
        # Provide general popular recommendations
        active_books = [b for b in books if b.is_active][:3]
        top_recs = [
            schemas.BookRecommendationItem(
                book=schemas.BookResponse.model_validate(b),
                match_score=75.0,
                recommendation_reason="Popular selection from our verified public library catalog.",
                is_similar_alternative=True
            )
            for b in active_books
        ]
        reply_text = (
            f"While our catalog doesn't have an exact match for \"{msg_clean}\", "
            "I've gathered these widely appreciated volumes from our stacks that you might enjoy exploring:"
        )

    return schemas.AIChatResponse(
        reply=reply_text,
        understood_intent=fallback_res.understood_intent,
        recommendations=top_recs,
        mode="demo_rule_based",
        ai_powered=False,
        timestamp=now_iso
    )

