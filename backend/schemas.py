from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import date, datetime

# --- Auth & User Schemas ---
class UserRegister(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    phone: Optional[str] = None
    role: Optional[str] = "user"  # "user" | "librarian"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    phone: Optional[str]
    member_card_no: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    email: EmailStr
    reset_code: str
    new_password: str

# --- Book Schemas ---
class BookBase(BaseModel):
    title: str
    author: str
    isbn: Optional[str] = None
    category: str
    language: Optional[str] = "English"
    publisher: Optional[str] = None
    publication_year: Optional[int] = None
    description: str
    cover_url: Optional[str] = None
    shelf_location: Optional[str] = "General Stacks A1"
    total_copies: int = Field(default=1, ge=1)
    available_copies: int = Field(default=1, ge=0)
    is_active: bool = True
    tags: Optional[str] = ""

class BookCreate(BookBase):
    pass

class BookUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    isbn: Optional[str] = None
    category: Optional[str] = None
    language: Optional[str] = None
    publisher: Optional[str] = None
    publication_year: Optional[int] = None
    description: Optional[str] = None
    cover_url: Optional[str] = None
    shelf_location: Optional[str] = None
    total_copies: Optional[int] = None
    available_copies: Optional[int] = None
    is_active: Optional[bool] = None
    tags: Optional[str] = None

class BookResponse(BookBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class AISearchQuery(BaseModel):
    query: str
    category: Optional[str] = None
    language: Optional[str] = None
    only_available: Optional[bool] = False

class BookRecommendationItem(BaseModel):
    book: BookResponse
    match_score: float
    recommendation_reason: str
    is_similar_alternative: bool = False

class AISearchResult(BaseModel):
    query: str
    understood_intent: str
    total_matches: int
    results: List[BookRecommendationItem]
    ai_powered: bool

class ChatMessage(BaseModel):
    role: str  # "user" | "assistant" | "system"
    content: str

class AIChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    category: Optional[str] = None
    mood: Optional[str] = None

class AIChatResponse(BaseModel):
    reply: str
    understood_intent: str
    recommendations: List[BookRecommendationItem] = []
    mode: str  # "gemini_ai" | "demo_rule_based"
    ai_powered: bool
    timestamp: str

class AIStatusResponse(BaseModel):
    status: str
    mode: str
    ai_enabled: bool
    service: str
    model: str


# --- Borrowing Schemas ---
class BorrowCreate(BaseModel):
    user_id: Optional[int] = None
    book_id: int
    due_days: int = Field(default=14, ge=1, le=60)
    notes: Optional[str] = None

class BorrowReturnConfirm(BaseModel):
    librarian_notes: Optional[str] = None

class BorrowingRecordResponse(BaseModel):
    id: int
    user_id: int
    book_id: int
    borrow_date: date
    due_date: date
    return_date: Optional[date] = None
    status: str
    notes: Optional[str] = None
    librarian_notes: Optional[str] = None
    days_remaining: int
    renew_count: Optional[int] = 0
    renewals_remaining: Optional[int] = 2
    is_renewable: Optional[bool] = True
    book: BookResponse
    user: UserResponse

    class Config:
        from_attributes = True

class LibrarianOverviewStats(BaseModel):
    total_books: int
    total_copies: int
    available_copies: int
    registered_members: int
    active_borrowings: int
    overdue_borrowings: int
    returned_borrowings: int
    pending_requests: int
    total_feedback: int

class MemberSummaryResponse(BaseModel):
    id: int
    email: str
    full_name: str
    member_card_no: str
    phone: Optional[str] = None
    role: str
    is_active: Optional[bool] = True
    created_at: datetime
    active_loans_count: int
    overdue_loans_count: int
    total_borrowed_count: int

    class Config:
        from_attributes = True

class DateSimulationRequest(BaseModel):
    borrowing_id: int
    simulated_days_offset: int  # e.g., -3 for 3 days before, -1 for tomorrow, 0 for today, +4 for overdue

# --- Notification Schemas ---
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    borrowing_record_id: Optional[int]
    reminder_type: str
    title: str
    message: str
    is_read: bool
    sent_via_email: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- Feedback & Book Requests ---
class FeedbackCreate(BaseModel):
    user_name: str
    user_email: EmailStr
    rating: int = Field(default=5, ge=1, le=5)
    category: str
    comments: str
    feedback_type: Optional[str] = "feedback"
    target_book_title: Optional[str] = None

class FeedbackUpdateStatus(BaseModel):
    status: str  # "new", "under_review", "resolved"
    admin_response: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: int
    user_id: Optional[int]
    user_name: str
    user_email: str
    rating: int
    category: str
    comments: str
    feedback_type: str
    target_book_title: Optional[str]
    status: str
    admin_response: Optional[str]
    response_date: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True

class BookRequestCreate(BaseModel):
    user_name: Optional[str] = None
    user_email: Optional[EmailStr] = None
    book_title: Optional[str] = None
    title: Optional[str] = None
    author: str
    category: Optional[str] = None
    reason: Optional[str] = None

class BookRequestUpdateStatus(BaseModel):
    status: str  # "pending", "approved", "acquired", "rejected"
    librarian_response: Optional[str] = None
    librarian_notes: Optional[str] = None

class BookRequestResponse(BaseModel):
    id: int
    user_id: Optional[int]
    user_name: str
    user_email: str
    book_title: str
    author: str
    category: Optional[str]
    reason: Optional[str]
    status: str
    librarian_response: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# --- Announcement Schemas ---
class AnnouncementCreate(BaseModel):
    title: str
    content: str
    badge: Optional[str] = "Notice"
    is_pinned: Optional[bool] = False

class AnnouncementResponse(BaseModel):
    id: int
    title: str
    content: str
    badge: str
    is_pinned: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- Librarian Dashboard KPI Stats ---
class LibrarianStats(BaseModel):
    total_books: int
    available_books: int
    borrowed_books: int
    overdue_books: int
    due_soon_books: int
    registered_users: int
    pending_feedback: int
    pending_book_requests: int

# --- Library Schemas ---
class LibraryHours(BaseModel):
    weekdays: str
    saturday: str
    sunday: Optional[str] = None

class LibraryCoordinates(BaseModel):
    lat: Optional[float] = None
    lng: Optional[float] = None

class LibraryMapPosition(BaseModel):
    top: str
    left: str

class LibraryBase(BaseModel):
    name: str
    area: str
    locality: str
    region: str
    city: Optional[str] = "Mumbai"
    state: Optional[str] = "Maharashtra"
    country: Optional[str] = "India"
    pincode: str
    address: str
    nearestTransit: Optional[str] = None
    phone: str
    email: Optional[str] = None
    website: Optional[str] = None
    establishedYear: Optional[int] = None
    isFlagship: Optional[bool] = False
    isVerified: Optional[bool] = True
    verificationStatus: str
    accessType: str
    accessNote: Optional[str] = None
    supervisor: Optional[str] = None
    hours: LibraryHours
    services: List[str] = []
    accessibility: Optional[List[str]] = []
    mapPosition: LibraryMapPosition
    coordinates: Optional[LibraryCoordinates] = None
    mapSearchQuery: Optional[str] = None

class LibraryCreate(LibraryBase):
    id: str

class LibraryUpdate(BaseModel):
    name: Optional[str] = None
    area: Optional[str] = None
    locality: Optional[str] = None
    region: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    isVerified: Optional[bool] = None
    verificationStatus: Optional[str] = None
    hours: Optional[LibraryHours] = None
    services: Optional[List[str]] = None

class LibraryResponse(LibraryBase):
    id: str

