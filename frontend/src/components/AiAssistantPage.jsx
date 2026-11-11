import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Check, 
  Info, 
  RotateCcw, 
  MessageSquare, 
  Bot, 
  User, 
  Send, 
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Cpu,
  Brain,
  Zap,
  Smile,
  GraduationCap,
  Compass
} from 'lucide-react';
import { MOOD_OPTIONS, CATEGORIES } from '../data/booksData';
import { api } from '../services/api';

const MOOD_ICON_MAP = {
  Brain,
  Zap,
  Smile,
  GraduationCap,
  Compass,
  BookOpen
};

export default function AiAssistantPage({ 
  books = [], 
  onSelectBook, 
  onBorrowToggle, 
  borrowedBookIds = [] 
}) {
  // Input & Filter States
  const [inputValue, setInputValue] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSending, setIsSending] = useState(false);
  const [aiStatus, setAiStatus] = useState({
    mode: 'demo_rule_based',
    ai_enabled: false,
    service: 'Rule-Based Catalog NLP Concierge',
    model: 'deterministic-nlp-matcher-v1'
  });
  const [errorMessage, setErrorMessage] = useState(null);

  // Chat message history
  const [messages, setMessages] = useState([
    {
      id: 'welcome-msg',
      role: 'assistant',
      text: "Greetings, reader! I am your LibraryEase AI Literary Concierge. I can guide your reading journey across our Mumbai library holdings, recommend titles based on your mood or reading interests, locate shelf positions, and answer questions about our collections. What atmosphere, author, or subject calls to you today?",
      mode: 'demo_rule_based',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recommendations: []
    }
  ]);

  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);

  // Suggested Prompts for Quick AI Inspiration
  const suggestedPrompts = [
    'Deep philosophical fiction exploring parallel lives',
    'Gripping science-fiction and survival in space',
    'Indigenous botany, nature wisdom and ecology',
    'Ancient Stoic philosophy and calm resilience',
    'Cozy British mysteries with charming sleuths'
  ];

  // Fetch real-time AI backend status on mount
  useEffect(() => {
    let isMounted = true;
    const fetchStatus = async () => {
      try {
        const status = await api.ai.getStatus();
        if (isMounted && status) {
          setAiStatus(status);
        }
      } catch (err) {
        // Fallback default status
        if (isMounted) {
          setAiStatus({
            mode: 'demo_rule_based',
            ai_enabled: false,
            service: 'Rule-Based Catalog NLP Concierge',
            model: 'local-client-fallback'
          });
        }
      }
    };

    fetchStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-scroll to bottom of message thread
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  // Client-side fallback rule-based matching
  const generateLocalFallbackRecommendations = (queryText) => {
    const qLower = queryText.toLowerCase();
    const scored = books.map((book) => {
      let score = 0;
      const reasons = [];

      // Category match
      if (selectedCategory !== 'All' && book.category === selectedCategory) {
        score += 35;
        reasons.push(`Selected department: "${selectedCategory}"`);
      }

      // Mood match
      if (selectedMood && book.moods) {
        if (book.moods.some((m) => 
          m.toLowerCase().includes(selectedMood.toLowerCase()) || 
          selectedMood.toLowerCase().includes(m.toLowerCase())
        )) {
          score += 30;
          reasons.push(`Matches atmosphere: "${selectedMood}"`);
        }
      }

      // Keyword matching across title, author, description, tags
      const terms = qLower.split(/\s+/).filter((t) => t.length > 2);
      let matchedCount = 0;
      terms.forEach((term) => {
        if (book.title?.toLowerCase().includes(term)) matchedCount += 2;
        if (book.author?.toLowerCase().includes(term)) matchedCount += 2;
        if (book.description?.toLowerCase().includes(term)) matchedCount += 1;
        if (book.tags?.some((t) => t.toLowerCase().includes(term))) matchedCount += 1;
      });

      if (matchedCount > 0) {
        score += Math.min(35, matchedCount * 12);
        reasons.push(`Relevant catalog keyword match for "${queryText.trim()}"`);
      }

      // Rating bonus
      score += Math.round((book.rating || 4.5) * 4);

      return {
        book,
        score,
        matchPercentage: Math.min(99, Math.max(60, score)),
        reasons: reasons.length > 0 ? reasons : ['Verified title from library permanent collection']
      };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 3);
  };

  // Send Chat Message
  const handleSendMessage = async (customText = null) => {
    const textToSend = (customText || inputValue).trim();
    if (!textToSend || isSending) return;

    setErrorMessage(null);
    setInputValue('');

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsSending(true);

    // Prepare API history
    const historyPayload = messages
      .filter((m) => m.id !== 'welcome-msg')
      .map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

    try {
      // 1. Call Backend AI Chat endpoint
      const response = await api.ai.chat({
        message: textToSend,
        history: historyPayload,
        category: selectedCategory !== 'All' ? selectedCategory : null,
        mood: selectedMood || null
      });

      if (response && response.reply) {
        const botMessage = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          text: response.reply,
          mode: response.mode || 'demo_rule_based',
          understoodIntent: response.understood_intent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          recommendations: (response.recommendations || []).map((rec) => ({
            book: rec.book,
            matchPercentage: Math.min(99, Math.max(65, Math.round(rec.match_score))),
            reasons: rec.recommendation_reason ? [rec.recommendation_reason] : ['Recommended by LibraryEase catalog curation algorithm.']
          }))
        };

        setMessages((prev) => [...prev, botMessage]);
        setIsSending(false);
        return;
      }
    } catch (err) {
      console.warn('Backend AI Chat endpoint unreachable or failed, engaging transparent local fallback:', err);
    }

    // 2. Resilient Local Client Fallback (Rule-Based Demo Mode)
    setTimeout(() => {
      const localRecs = generateLocalFallbackRecommendations(textToSend);
      const isGreeting = /^(hi|hello|hey|namaste|good|greetings)\b/i.test(textToSend);

      let replyText = '';
      if (isGreeting) {
        replyText = "Greetings! I am active in Demo Mode using our intelligent catalog matcher. Ask me for recommendations by topic, mood, or author, and I'll curate available works from our Mumbai library holdings.";
      } else if (localRecs.length > 0) {
        const titles = localRecs.map((r) => `'${r.book.title}'`).join(', ');
        replyText = `I've analyzed our library stacks for "${textToSend}" and selected ${localRecs.length} fitting titles, including ${titles}. Here are their details:`;
      } else {
        replyText = `I reviewed our holdings for "${textToSend}". Here are some widely appreciated selections from our catalog that you might enjoy:`;
      }

      const fallbackBotMessage = {
        id: `bot-fallback-${Date.now()}`,
        role: 'assistant',
        text: replyText,
        mode: 'demo_rule_based',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendations: localRecs
      };

      setMessages((prev) => [...prev, fallbackBotMessage]);
      setIsSending(false);
    }, 400);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-msg-reset',
        role: 'assistant',
        text: "Conversation refreshed. What book, topic, or literary mood would you like to explore today?",
        mode: aiStatus.mode,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendations: []
      }
    ]);
    setInputValue('');
    setSelectedMood('');
    setSelectedCategory('All');
    setErrorMessage(null);
  };

  return (
    <div className="ai-assistant-page-view">
      {/* Header Band */}
      <section className="page-header-band">
        <div className="container">
          <span className="page-breadcrumb">Smart Discovery &gt; AI Book Assistant</span>
          <h1 className="page-title">AI Book Recommendation Assistant</h1>
          <p className="page-description">
            A vintage reading sanctuary meets modern intelligence. Connect your literary mood, 
            reading pace, and interests with verified works in our library catalog.
          </p>
        </div>
      </section>

      <div className="container main-assistant-container">
        {/* Architecture & Mode Indicator Banner */}
        <div className="ai-architecture-card">
          <div className="lavender-bot-badge">
            <Bot size={22} />
          </div>
          <div className="ai-architecture-text">
            <div className="ai-status-row">
              <strong>Interactive AI Assistant:</strong>
              {aiStatus.ai_enabled ? (
                <span className="ai-mode-pill live-pill">
                  <Sparkles size={12} /> Live Gemini AI Active
                </span>
              ) : (
                <span className="ai-mode-pill demo-pill" title="Transparent Rule-Based Catalog Matching. To connect live Gemini AI, set GEMINI_API_KEY in backend/.env.">
                  <Cpu size={12} /> Demo Mode: Rule-Based Recommendations
                </span>
              )}
            </div>
            <p className="ai-mode-explanation">
              {aiStatus.ai_enabled ? (
                "Connected to Google Gemini 1.5 Flash with live catalog context. Ask questions, explore themes, and receive AI-curated recommendations."
              ) : (
                "Operating in transparent Demo Mode using our intelligent deterministic NLP catalog engine. No external API key required out-of-the-box."
              )}
            </p>
          </div>
        </div>

        {/* Suggested Quick Prompts */}
        <div className="suggested-prompts-section">
          <span className="prompts-lead">
            <Sparkles size={14} className="sparkle-icon" /> Suggested Inquiries:
          </span>
          <div className="prompts-pills-wrap">
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                className="suggested-prompt-chip"
                onClick={() => {
                  setInputValue(p);
                  handleSendMessage(p);
                }}
                disabled={isSending}
              >
                &ldquo;{p}&rdquo;
              </button>
            ))}
          </div>
        </div>

        {/* Chat Interface Container */}
        <div className="ai-chat-card-container">
          {/* Chat Window Top Bar */}
          <div className="chat-window-topbar">
            <div className="chat-librarian-profile">
              <div className="librarian-avatar">
                <Bot size={18} />
              </div>
              <div className="librarian-info">
                <h3 className="librarian-name">LibraryEase Literary Concierge</h3>
                <span className="librarian-status">
                  <span className="status-indicator-dot online" /> 
                  {aiStatus.ai_enabled ? 'Gemini AI Assistant • Ready' : 'Rule-Based Assistant • Active'}
                </span>
              </div>
            </div>

            <div className="chat-top-actions">
              <button
                type="button"
                className="chat-clear-btn"
                onClick={handleClearChat}
                title="Reset conversation"
              >
                <RotateCcw size={14} />
                <span>New Chat</span>
              </button>
            </div>
          </div>

          {/* Quick Filters Tuning Strip (Optional Mood & Category) */}
          <div className="chat-tuning-strip">
            <span className="tuning-label">Fine-tune Focus:</span>
            <div className="tuning-controls">
              {/* Category Dropdown */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="tuning-select"
                aria-label="Filter by department"
              >
                <option value="All">All Departments</option>
                {CATEGORIES.filter((c) => c !== 'All Categories').map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Mood Pills (Horizontally scrollable) */}
              <div className="tuning-mood-pills">
                {MOOD_OPTIONS.slice(0, 4).map((mood) => {
                  const IconComponent = MOOD_ICON_MAP[mood.icon];
                  const isSelected = selectedMood === mood.label;

                  return (
                    <button
                      key={mood.id}
                      type="button"
                      className={`tuning-mood-pill ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedMood(isSelected ? '' : mood.label)}
                      title={mood.label}
                      aria-pressed={isSelected}
                    >
                      {isSelected ? (
                        <Check size={11} className="mood-pill-check-icon" />
                      ) : (
                        IconComponent && <IconComponent size={12} className="mood-pill-icon" />
                      )}
                      <span>{mood.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Message Thread Stream */}
          <div className="chat-messages-stream" role="log" aria-live="polite">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message-bubble-row ${msg.role}`}>
                <div className={`message-avatar ${msg.role}`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>

                <div className={`message-bubble-content ${msg.role}`}>
                  <div className="message-header-meta">
                    <span className="message-sender-name">
                      {msg.role === 'user' ? 'You' : 'AI Literary Concierge'}
                    </span>
                    <span className="message-timestamp">{msg.timestamp}</span>
                    {msg.role === 'assistant' && (
                      <span className={`message-mode-tag ${msg.mode}`}>
                        {msg.mode === 'gemini_ai' ? 'Gemini AI' : 'Demo Mode'}
                      </span>
                    )}
                  </div>

                  <p className="message-text-body">{msg.text}</p>

                  {/* Inline Book Recommendations if attached */}
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="message-inline-recommendations">
                      <div className="recs-lead-tag">
                        <Sparkles size={13} />
                        <span>Curated Selections From Stacks ({msg.recommendations.length})</span>
                      </div>

                      <div className="inline-recs-grid">
                        {msg.recommendations.map(({ book, matchPercentage, reasons }, rIdx) => {
                          const isBorrowed = borrowedBookIds.includes(book.id);

                          return (
                            <div key={book.id || rIdx} className="inline-book-recommendation-card">
                              <div className="card-top-spine">
                                <span className="rec-rank-chip">#{rIdx + 1} Match</span>
                                <span className="rec-score-pill">{matchPercentage}% Match</span>
                              </div>

                              <div className="card-book-content">
                                <h4 className="rec-book-title">{book.title}</h4>
                                <p className="rec-book-author">by {book.author}</p>
                                <span className="rec-book-category">{book.category}</span>

                                <p className="rec-book-desc">{book.description}</p>

                                {reasons && reasons.length > 0 && (
                                  <div className="rec-rationale-box">
                                    <span className="rationale-lbl">Curator Rationale:</span>
                                    <p className="rationale-txt">{reasons[0]}</p>
                                  </div>
                                )}

                                <div className="rec-availability-strip">
                                  <span className="rec-shelf">Shelf: {book.shelfLocation || book.shelf_location || 'General Stacks'}</span>
                                  <span className="rec-avail-tag">
                                    {book.available_copies !== undefined 
                                      ? (book.available_copies > 0 ? '✓ Available on Shelf' : '⚠ On Loan') 
                                      : (book.availability || 'Available')}
                                  </span>
                                </div>

                                <div className="rec-actions-row">
                                  <button
                                    type="button"
                                    className="rec-details-btn"
                                    onClick={() => onSelectBook(book)}
                                    title="View full details"
                                  >
                                    View Details
                                  </button>
                                  <button
                                    type="button"
                                    className={`rec-borrow-btn ${isBorrowed ? 'is-borrowed' : ''}`}
                                    onClick={() => onBorrowToggle(book)}
                                    title={isBorrowed ? 'Return to library' : 'Borrow book'}
                                  >
                                    {isBorrowed ? 'Check In (Return)' : 'Borrow Book'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading Indicator when Processing Query */}
            {isSending && (
              <div className="chat-message-bubble-row assistant">
                <div className="message-avatar assistant">
                  <Bot size={16} />
                </div>
                <div className="message-bubble-content assistant loading-state">
                  <div className="typing-indicator-wrap">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                  <span className="typing-label-text">
                    Consulting library catalog and curating recommendations...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Error Banner if Query Failed */}
          {errorMessage && (
            <div className="chat-error-alert" role="alert">
              <AlertTriangle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Chat Input Bar */}
          <div className="chat-input-toolbar">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="chat-form-row"
            >
              <div className="chat-input-wrapper">
                <MessageSquare size={17} className="chat-input-icon" />
                <input
                  ref={chatInputRef}
                  type="text"
                  placeholder="Ask for a book recommendation, author, mood, or subject..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="chat-text-input"
                  disabled={isSending}
                  aria-label="Message AI Assistant"
                />
                {inputValue && (
                  <button
                    type="button"
                    className="chat-clear-input-btn"
                    onClick={() => setInputValue('')}
                    aria-label="Clear input"
                  >
                    &times;
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="chat-send-btn"
                disabled={!inputValue.trim() || isSending}
                title="Send inquiry"
                aria-label="Send message to AI Assistant"
              >
                <Send size={16} />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
