import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import date, datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from apscheduler.schedulers.background import BackgroundScheduler

from config import settings
from database import SessionLocal
import models

logger = logging.getLogger("libraryease.scheduler")

scheduler = BackgroundScheduler()

def send_email_notification(to_email: str, subject: str, message: str) -> bool:
    """
    Sends email if SMTP settings are configured.
    Otherwise logs the simulated email dispatch safely.
    """
    if not settings.SMTP_HOST or not settings.SMTP_USER:
        logger.info(f"[EMAIL SIMULATION] Sent to {to_email} | Subject: '{subject}' | Message: '{message}'")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.SENDER_EMAIL
        msg["To"] = to_email

        html_content = f"""
        <div style="font-family: Arial, sans-serif; background-color: #f7f4ee; padding: 24px; border-radius: 8px;">
            <div style="background-color: #1b4332; color: #ffffff; padding: 16px 20px; border-radius: 6px;">
                <h2 style="margin: 0; font-size: 20px;">LibraryEase Notification</h2>
            </div>
            <div style="padding: 20px 8px; color: #2d3748; line-height: 1.6;">
                <p style="font-size: 16px;">{message}</p>
                <p style="color: #718096; font-size: 14px; margin-top: 24px;">
                    This is an automated reminder from {settings.LIBRARY_NAME}. Please do not reply directly.
                </p>
            </div>
        </div>
        """
        msg.attach(MIMEText(html_content, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=5) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SENDER_EMAIL, to_email, msg.as_string())
        logger.info(f"Successfully delivered email reminder to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False

def evaluate_and_dispatch_reminders(db: Session) -> Dict[str, Any]:
    """
    Evaluates all active (unreturned) borrowing records against current date.
    Updates record status and issues deduplicated notifications for:
    - 3 days before due date
    - 1 day before due date
    - On the due date
    - Overdue (past due date)
    """
    today = date.today()
    active_records = db.query(models.BorrowingRecord).filter(
        models.BorrowingRecord.status != "returned"
    ).all()

    stats = {
        "scanned_records": len(active_records),
        "notifications_created": 0,
        "status_updated": 0,
        "duplicates_skipped": 0,
        "details": []
    }

    for record in active_records:
        user = record.user
        book = record.book
        if not user or not book:
            continue

        days_remaining = (record.due_date - today).days

        # Determine appropriate status
        new_status = record.status
        if days_remaining > 3:
            new_status = "borrowed"
        elif 1 <= days_remaining <= 3:
            new_status = "due_soon"
        elif days_remaining == 0:
            new_status = "due_today"
        elif days_remaining < 0:
            new_status = "overdue"

        if new_status != record.status:
            record.status = new_status
            stats["status_updated"] += 1

        # Check reminder triggers
        stage: str = ""
        reminder_title: str = ""
        reminder_msg: str = ""

        if days_remaining == 3:
            stage = "due_in_3_days"
            reminder_title = "Book Due in 3 Days"
            reminder_msg = f"Your book '{book.title}' is due in 3 days. Please return it by {record.due_date}."
        elif days_remaining == 1:
            stage = "due_tomorrow"
            reminder_title = "Book Due Tomorrow"
            reminder_msg = f"Reminder: Your book '{book.title}' is due tomorrow. Please plan your return."
        elif days_remaining == 0:
            stage = "due_today"
            reminder_title = "Book Due Today"
            reminder_msg = f"Your book '{book.title}' is due today. Please return it to the library."
        elif days_remaining < 0:
            stage = "overdue"
            reminder_title = "Book Overdue Alert"
            reminder_msg = f"Your book '{book.title}' is overdue. Please return it as soon as possible or contact the library."

        if stage:
            # Check for existing notification with same (borrowing_record_id, reminder_type)
            existing_notif = db.query(models.Notification).filter(
                models.Notification.borrowing_record_id == record.id,
                models.Notification.reminder_type == stage
            ).first()

            if existing_notif:
                stats["duplicates_skipped"] += 1
            else:
                # Dispatch new notification
                notif = models.Notification(
                    user_id=user.id,
                    borrowing_record_id=record.id,
                    reminder_type=stage,
                    title=reminder_title,
                    message=reminder_msg,
                    is_read=False,
                    sent_via_email=False
                )
                db.add(notif)
                db.flush()

                # Dispatch email if possible
                email_sent = send_email_notification(user.email, reminder_title, reminder_msg)
                if email_sent:
                    notif.sent_via_email = True

                stats["notifications_created"] += 1
                stats["details"].append({
                    "borrowing_id": record.id,
                    "book_title": book.title,
                    "user_email": user.email,
                    "stage": stage,
                    "due_date": str(record.due_date),
                    "days_remaining": days_remaining
                })

    db.commit()
    return stats

def run_reminder_scan_sync() -> Dict[str, Any]:
    db = SessionLocal()
    try:
        return evaluate_and_dispatch_reminders(db)
    finally:
        db.close()

def start_scheduler():
    if not scheduler.running:
        # Run scan once at startup
        try:
            run_reminder_scan_sync()
        except Exception as e:
            logger.error(f"Initial reminder scan error: {e}")

        # Schedule every 30 minutes
        scheduler.add_job(
            run_reminder_scan_sync, 
            'interval', 
            minutes=30, 
            id='check_book_reminders', 
            replace_existing=True
        )
        scheduler.start()
        logger.info("Automatic book return reminder scheduler started.")

def shutdown_scheduler():
    if scheduler.running:
        scheduler.shutdown(wait=False)
