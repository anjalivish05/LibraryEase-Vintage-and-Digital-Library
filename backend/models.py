from datetime import datetime, date
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Date, DateTime, 
    ForeignKey, UniqueConstraint
)
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="user", nullable=False)  # "user" | "librarian"
    phone = Column(String(50), nullable=True)
    member_card_no = Column(String(50), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    borrowing_records = relationship("BorrowingRecord", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    feedback_entries = relationship("Feedback", back_populates="user")
    book_requests = relationship("BookRequest", back_populates="user")


class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True, nullable=False)
    author = Column(String(255), index=True, nullable=False)
    isbn = Column(String(50), unique=True, index=True, nullable=True)
    category = Column(String(100), index=True, nullable=False)
    language = Column(String(50), default="English", nullable=False)
    publisher = Column(String(255), nullable=True)
    publication_year = Column(Integer, nullable=True)
    description = Column(Text, nullable=False)
    cover_url = Column(String(500), nullable=True)
    shelf_location = Column(String(100), default="General Stacks A1", nullable=False)
    total_copies = Column(Integer, default=1, nullable=False)
    available_copies = Column(Integer, default=1, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    tags = Column(String(255), default="", nullable=False)  # comma-separated keywords
    created_at = Column(DateTime, default=datetime.utcnow)

    borrowing_records = relationship("BorrowingRecord", back_populates="book")


class BorrowingRecord(Base):
    __tablename__ = "borrowing_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    book_id = Column(Integer, ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    borrow_date = Column(Date, default=date.today, nullable=False)
    due_date = Column(Date, nullable=False)
    return_date = Column(Date, nullable=True)
    status = Column(String(50), default="borrowed", nullable=False)
    # Statuses: "borrowed", "due_soon", "due_today", "overdue", "returned"
    renew_count = Column(Integer, default=0, nullable=False)
    notes = Column(Text, nullable=True)
    librarian_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="borrowing_records")
    book = relationship("Book", back_populates="borrowing_records")
    notifications = relationship("Notification", back_populates="borrowing_record", cascade="all, delete-orphan")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    borrowing_record_id = Column(Integer, ForeignKey("borrowing_records.id", ondelete="CASCADE"), nullable=True)
    reminder_type = Column(String(50), nullable=False)
    # Types: "due_in_3_days", "due_tomorrow", "due_today", "overdue", "borrow_confirmation", "return_confirmation", "feedback_response", "general"
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    sent_via_email = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")
    borrowing_record = relationship("BorrowingRecord", back_populates="notifications")

    # Constraint to prevent duplicate reminders for the same borrowing stage
    __table_args__ = (
        UniqueConstraint('borrowing_record_id', 'reminder_type', name='uq_borrowing_record_reminder_stage'),
    )


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    user_name = Column(String(255), nullable=False)
    user_email = Column(String(255), nullable=False)
    rating = Column(Integer, default=5, nullable=False)
    category = Column(String(100), nullable=False)
    # Categories: "Book Availability", "Staff Support", "Library Facilities", "Website Experience", "Other"
    comments = Column(Text, nullable=False)
    feedback_type = Column(String(50), default="feedback", nullable=False)  # "feedback", "book_request", "data_correction"
    target_book_title = Column(String(255), nullable=True)
    status = Column(String(50), default="new", nullable=False)  # "new", "under_review", "resolved"
    admin_response = Column(Text, nullable=True)
    response_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="feedback_entries")


class BookRequest(Base):
    __tablename__ = "book_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    user_name = Column(String(255), nullable=False)
    user_email = Column(String(255), nullable=False)
    book_title = Column(String(255), nullable=False)
    author = Column(String(255), nullable=False)
    category = Column(String(100), nullable=True)
    reason = Column(Text, nullable=True)
    status = Column(String(50), default="pending", nullable=False)  # "pending", "approved", "acquired", "rejected"
    librarian_response = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="book_requests")


class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    badge = Column(String(50), default="Notice", nullable=False)
    is_pinned = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Library(Base):
    __tablename__ = "libraries"

    id = Column(String(50), primary_key=True, index=True)  # e.g., 'mumbai-lib-1'
    name = Column(String(255), nullable=False, index=True)
    area = Column(String(100), nullable=False, index=True)
    locality = Column(String(150), nullable=False)
    region = Column(String(100), nullable=False)
    city = Column(String(100), default="Mumbai", nullable=False)
    state = Column(String(100), default="Maharashtra", nullable=False)
    country = Column(String(100), default="India", nullable=False)
    pincode = Column(String(20), nullable=False)
    address = Column(Text, nullable=False)
    nearest_transit = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=False)
    email = Column(String(150), nullable=True)
    website = Column(String(255), nullable=True)
    established_year = Column(Integer, nullable=True)
    is_flagship = Column(Boolean, default=False, nullable=False)
    is_verified = Column(Boolean, default=True, nullable=False)
    verification_status = Column(String(100), nullable=False)
    access_type = Column(String(200), nullable=False)
    access_note = Column(Text, nullable=True)
    supervisor = Column(String(150), nullable=True)
    hours_weekdays = Column(String(100), nullable=False)
    hours_saturday = Column(String(100), nullable=False)
    hours_sunday = Column(String(100), nullable=True)
    services_json = Column(Text, nullable=False)  # JSON-encoded array of services
    accessibility_json = Column(Text, nullable=True)  # JSON-encoded array
    map_top = Column(String(20), default="50%", nullable=False)
    map_left = Column(String(20), default="50%", nullable=False)
    latitude = Column(String(50), nullable=True)
    longitude = Column(String(50), nullable=True)
    map_search_query = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

