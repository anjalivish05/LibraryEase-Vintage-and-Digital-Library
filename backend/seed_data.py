from datetime import date, timedelta, datetime
from sqlalchemy.orm import Session
import models
from security import hash_password

def seed_database(db: Session):
    seed_users_and_catalog(db)
    seed_libraries(db)

def seed_users_and_catalog(db: Session):
    # Check if already seeded
    if db.query(models.User).first():
        return

    print("Seeding LibraryEase database with rich library catalog & demo accounts...")

    # 1. Create Users
    librarian = models.User(
        email="librarian@libraryease.org",
        full_name="Eleanor Vance (Head Librarian)",
        hashed_password=hash_password("admin123"),
        role="librarian",
        phone="+1 (555) 234-5678",
        member_card_no="LIB-0001"
    )
    patron1 = models.User(
        email="patron@libraryease.org",
        full_name="Alex Morgan",
        hashed_password=hash_password("patron123"),
        role="user",
        phone="+1 (555) 345-6789",
        member_card_no="PAT-8801"
    )
    patron2 = models.User(
        email="sarah.chen@example.com",
        full_name="Sarah Chen",
        hashed_password=hash_password("patron123"),
        role="user",
        phone="+1 (555) 456-7890",
        member_card_no="PAT-8802"
    )
    patron3 = models.User(
        email="david.miller@example.com",
        full_name="David Miller",
        hashed_password=hash_password("patron123"),
        role="user",
        phone="+1 (555) 567-8901",
        member_card_no="PAT-8803"
    )

    db.add_all([librarian, patron1, patron2, patron3])
    db.flush()

    # 2. Rich Books Catalog
    books_data = [
        # Computer Science & Python
        {
            "title": "Python Crash Course: A Hands-On, Project-Based Introduction to Programming",
            "author": "Eric Matthes",
            "isbn": "978-1593279288",
            "category": "Computer Science",
            "language": "English",
            "publisher": "No Starch Press",
            "publication_year": 2023,
            "description": "A beginner-friendly guide to Python programming. Learn basic programming concepts, write clean code, and create interactive video games, data visualizations, and web applications.",
            "cover_url": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
            "shelf_location": "Aisle 3, Shelf CS-101",
            "total_copies": 4,
            "available_copies": 3,
            "tags": "python, beginner, coding, programming, projects, software"
        },
        {
            "title": "Automate the Boring Stuff with Python",
            "author": "Al Sweigart",
            "isbn": "978-1593279929",
            "category": "Computer Science",
            "language": "English",
            "publisher": "No Starch Press",
            "publication_year": 2022,
            "description": "Practical programming for total beginners. Learn how to use Python to write programs that do in minutes what would take you hours to do by hand.",
            "cover_url": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&auto=format&fit=crop&q=80",
            "shelf_location": "Aisle 3, Shelf CS-102",
            "total_copies": 3,
            "available_copies": 2,
            "tags": "python, automation, beginner, scripts, practical programming"
        },
        {
            "title": "Designing Data-Intensive Applications",
            "author": "Martin Kleppmann",
            "isbn": "978-1449373320",
            "category": "Computer Science",
            "language": "English",
            "publisher": "O'Reilly Media",
            "publication_year": 2021,
            "description": "The big ideas behind reliable, scalable, and maintainable systems. Key principles for distributed systems, replication, partitioning, and stream processing.",
            "cover_url": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80",
            "shelf_location": "Aisle 3, Shelf CS-204",
            "total_copies": 2,
            "available_copies": 1,
            "tags": "system design, distributed systems, database, architecture, advanced"
        },
        {
            "title": "Clean Code: A Handbook of Agile Software Craftsmanship",
            "author": "Robert C. Martin",
            "isbn": "978-0132350884",
            "category": "Computer Science",
            "language": "English",
            "publisher": "Prentice Hall",
            "publication_year": 2020,
            "description": "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees. Master software craftsmanship and refactoring.",
            "cover_url": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80",
            "shelf_location": "Aisle 3, Shelf CS-105",
            "total_copies": 3,
            "available_copies": 0,  # Demonstrates unavailable book with similar recommendations!
            "tags": "clean code, software engineering, best practices, agile"
        },

        # Self-Help & Motivational
        {
            "title": "Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones",
            "author": "James Clear",
            "isbn": "978-0735211292",
            "category": "Self-Help & Motivation",
            "language": "English",
            "publisher": "Avery",
            "publication_year": 2021,
            "description": "No matter your goals, Atomic Habits offers a proven framework for improving every day. Inspiring guide for students and professionals looking to optimize focus and consistency.",
            "cover_url": "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&auto=format&fit=crop&q=80",
            "shelf_location": "Aisle 1, Shelf SH-12",
            "total_copies": 5,
            "available_copies": 3,
            "tags": "motivational, habits, student, productivity, discipline, personal development"
        },
        {
            "title": "Deep Work: Rules for Focused Success in a Distracted World",
            "author": "Cal Newport",
            "isbn": "978-1455586691",
            "category": "Self-Help & Motivation",
            "language": "English",
            "publisher": "Grand Central Publishing",
            "publication_year": 2020,
            "description": "Deep work is the ability to focus without distraction on a cognitively demanding task. Essential reading for students preparing for examinations and high-performance careers.",
            "cover_url": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80",
            "shelf_location": "Aisle 1, Shelf SH-14",
            "total_copies": 3,
            "available_copies": 2,
            "tags": "focus, student, study, productivity, motivation, deep work"
        },
        {
            "title": "Mindset: The New Psychology of Success",
            "author": "Carol S. Dweck",
            "isbn": "978-0345472327",
            "category": "Self-Help & Motivation",
            "language": "English",
            "publisher": "Ballantine Books",
            "publication_year": 2020,
            "description": "World-renowned Stanford University psychologist Carol Dweck explains how a growth mindset empowers students to overcome challenges, embrace learning, and achieve their dreams.",
            "cover_url": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80",
            "shelf_location": "Aisle 1, Shelf SH-15",
            "total_copies": 2,
            "available_copies": 1,
            "tags": "growth mindset, student, motivation, psychology, learning"
        },

        # Children's Literature
        {
            "title": "Charlotte's Web",
            "author": "E.B. White",
            "isbn": "978-0064400558",
            "category": "Children's Literature",
            "language": "English",
            "publisher": "HarperCollins",
            "publication_year": 2019,
            "description": "An affectionate, gentle, and easy English story of friendship between a pig named Wilbur and a clever spider named Charlotte. Perfect bedtime reading for young children.",
            "cover_url": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80",
            "shelf_location": "Children's Wing, Shelf CH-04",
            "total_copies": 4,
            "available_copies": 3,
            "tags": "children, kids, storybook, animal story, easy english, friendship"
        },
        {
            "title": "The Little Prince",
            "author": "Antoine de Saint-Exupéry",
            "isbn": "978-0156012195",
            "category": "Children's Literature",
            "language": "English",
            "publisher": "Mariner Books",
            "publication_year": 2020,
            "description": "A poetic tale with watercolor illustrations by the author, in which an aviator stranded in the desert meets a young prince fallen to Earth from a tiny asteroid.",
            "cover_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
            "shelf_location": "Children's Wing, Shelf CH-05",
            "total_copies": 3,
            "available_copies": 2,
            "tags": "children, easy english, bedtime story, classic fable, kids"
        },
        {
            "title": "Where the Wild Things Are",
            "author": "Maurice Sendak",
            "isbn": "978-0060254926",
            "category": "Children's Literature",
            "language": "English",
            "publisher": "Harper & Row",
            "publication_year": 2018,
            "description": "Max sails away to where the wild things are and becomes king of all wild things. A beloved, richly illustrated picture book for early readers.",
            "cover_url": "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=600&auto=format&fit=crop&q=80",
            "shelf_location": "Children's Wing, Shelf CH-01",
            "total_copies": 3,
            "available_copies": 1,
            "tags": "children, kids, easy reading, imagination, bedtime story"
        },

        # Science & Nature
        {
            "title": "Cosmos: A Personal Voyage Through Space and Time",
            "author": "Carl Sagan",
            "isbn": "978-0345539434",
            "category": "Science & Nature",
            "language": "English",
            "publisher": "Ballantine Books",
            "publication_year": 2021,
            "description": "The story of fifteen billion years of cosmic evolution transforming matter and life into consciousness. Explores astronomy, history, civilization, and our place in the universe.",
            "cover_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
            "shelf_location": "Aisle 4, Shelf SCI-10",
            "total_copies": 3,
            "available_copies": 2,
            "tags": "science, cosmos, astronomy, universe, physics, popular science"
        },
        {
            "title": "A Brief History of Time",
            "author": "Stephen Hawking",
            "isbn": "978-0553380163",
            "category": "Science & Nature",
            "language": "English",
            "publisher": "Bantam",
            "publication_year": 2020,
            "description": "Stephen Hawking’s landmark exploration of black holes, the big bang, antimatter, general relativity, and the search for a unified theory of physics.",
            "cover_url": "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop&q=80",
            "shelf_location": "Aisle 4, Shelf SCI-11",
            "total_copies": 3,
            "available_copies": 3,
            "tags": "physics, science, cosmology, space, time, quantum theory"
        },
        {
            "title": "The Gene: An Intimate History",
            "author": "Siddhartha Mukherjee",
            "isbn": "978-1476733524",
            "category": "Science & Nature",
            "language": "English",
            "publisher": "Scribner",
            "publication_year": 2020,
            "description": "A magnificent history of the gene and a response to the defining question of the future: What does it mean to be human when we learn to read and write our own genetic code?",
            "cover_url": "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=600&auto=format&fit=crop&q=80",
            "shelf_location": "Aisle 4, Shelf SCI-14",
            "total_copies": 2,
            "available_copies": 1,
            "tags": "genetics, biology, science, medical history, human genome"
        },

        # Fantasy & Fiction (Harry Potter style)
        {
            "title": "Harry Potter and the Sorcerer's Stone",
            "author": "J.K. Rowling",
            "isbn": "978-0590353427",
            "category": "Fantasy & Adventure",
            "language": "English",
            "publisher": "Scholastic",
            "publication_year": 2018,
            "description": "Harry Potter has never even heard of Hogwarts when the letters start dropping on the doormat. Step into the magical wizarding world of spells, potions, and unforgettable friendship.",
            "cover_url": "https://images.unsplash.com/photo-1618609377864-68609b857e90?w=600&auto=format&fit=crop&q=80",
            "shelf_location": "Aisle 2, Shelf FAN-01",
            "total_copies": 4,
            "available_copies": 1,
            "tags": "harry potter, magic, wizard, hogwarts, fantasy, adventure, mystery"
        },
        {
            "title": "Percy Jackson: The Lightning Thief",
            "author": "Rick Riordan",
            "isbn": "978-0786838653",
            "category": "Fantasy & Adventure",
            "language": "English",
            "publisher": "Disney-Hyperion",
            "publication_year": 2020,
            "description": "Percy Jackson is about to be kicked out of boarding school... again. Discovering he is a demigod son of Poseidon, he embarks on an epic quest. Ideal for fans of Harry Potter.",
            "cover_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80",
            "shelf_location": "Aisle 2, Shelf FAN-03",
            "total_copies": 3,
            "available_copies": 2,
            "tags": "fantasy, mythology, adventure, magic, similar to harry potter, teen"
        },
        {
            "title": "The Hobbit: Or There and Back Again",
            "author": "J.R.R. Tolkien",
            "isbn": "978-0547928227",
            "category": "Fantasy & Adventure",
            "language": "English",
            "publisher": "Houghton Mifflin",
            "publication_year": 2019,
            "description": "Bilbo Baggins is a hobbit who enjoys a comfortable, unambitious life. But his contentment is disturbed when Gandalf the wizard and thirteen dwarves arrive to seek dragon treasure.",
            "cover_url": "https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=600&auto=format&fit=crop&q=80",
            "shelf_location": "Aisle 2, Shelf FAN-02",
            "total_copies": 4,
            "available_copies": 3,
            "tags": "fantasy, epic adventure, middle earth, magic, tolkien, classic"
        },

        # Classic Literature & History
        {
            "title": "To Kill a Mockingbird",
            "author": "Harper Lee",
            "isbn": "978-0060935467",
            "category": "Classic Literature",
            "language": "English",
            "publisher": "Harper Perennial",
            "publication_year": 2019,
            "description": "A gripping, heart-wrenching, and wholly remarkable tale of coming-of-age in a South poisoned by virulent prejudice. A masterpiece of American literature.",
            "cover_url": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80",
            "shelf_location": "Aisle 5, Shelf LIT-02",
            "total_copies": 3,
            "available_copies": 2,
            "tags": "classics, literature, justice, drama, historical fiction"
        },
        {
            "title": "1984",
            "author": "George Orwell",
            "isbn": "978-0451524935",
            "category": "Classic Literature",
            "language": "English",
            "publisher": "Signet Classic",
            "publication_year": 2021,
            "description": "The chilling dystopian classic about Big Brother, Thought Police, and totalitarian control. A timeless warning on censorship and truth.",
            "cover_url": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80",
            "shelf_location": "Aisle 5, Shelf LIT-05",
            "total_copies": 4,
            "available_copies": 3,
            "tags": "dystopian, classics, politics, surveillance, literature"
        },
        {
            "title": "Sapiens: A Brief History of Humankind",
            "author": "Yuval Noah Harari",
            "isbn": "978-0062316097",
            "category": "History & Civilization",
            "language": "English",
            "publisher": "Harper",
            "publication_year": 2021,
            "description": "From a renowned historian comes a groundbreaking narrative of humanity's creation and evolution—how biology and history have defined us and enhanced our understanding of what it means to be human.",
            "cover_url": "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=600&auto=format&fit=crop&q=80",
            "shelf_location": "Aisle 5, Shelf HIST-01",
            "total_copies": 3,
            "available_copies": 2,
            "tags": "history, anthropology, evolution, civilization, humankind"
        }
    ]

    book_objects = []
    for b in books_data:
        book_obj = models.Book(**b)
        db.add(book_obj)
        book_objects.append(book_obj)

    db.flush()

    # 3. Create Borrowing Records with specific past, present, and future due dates
    # To demonstrate all 4 reminder stages clearly!
    today = date.today()

    # Case A: Due in exactly 3 days -> triggers "due_in_3_days" reminder
    rec_3_days = models.BorrowingRecord(
        user_id=patron1.id,
        book_id=book_objects[0].id,  # Python Crash Course
        borrow_date=today - timedelta(days=11),
        due_date=today + timedelta(days=3),
        status="due_soon",
        notes="Checked out for Python web project course."
    )

    # Case B: Due in exactly 1 day (tomorrow) -> triggers "due_tomorrow" reminder
    rec_tomorrow = models.BorrowingRecord(
        user_id=patron1.id,
        book_id=book_objects[4].id,  # Atomic Habits
        borrow_date=today - timedelta(days=13),
        due_date=today + timedelta(days=1),
        status="due_soon",
        notes="Requested renewal once earlier."
    )

    # Case C: Due TODAY -> triggers "due_today" reminder
    rec_today = models.BorrowingRecord(
        user_id=patron1.id,
        book_id=book_objects[10].id,  # Cosmos
        borrow_date=today - timedelta(days=14),
        due_date=today,
        status="due_today",
        notes="Special astronomy seminar reference."
    )

    # Case D: Overdue by 4 days -> triggers "overdue" reminder
    rec_overdue = models.BorrowingRecord(
        user_id=patron1.id,
        book_id=book_objects[13].id,  # Harry Potter
        borrow_date=today - timedelta(days=18),
        due_date=today - timedelta(days=4),
        status="overdue",
        notes="System overdue alert flag set."
    )

    # Case E: Returned successfully (History)
    rec_returned1 = models.BorrowingRecord(
        user_id=patron1.id,
        book_id=book_objects[1].id,  # Automate the Boring Stuff
        borrow_date=today - timedelta(days=30),
        due_date=today - timedelta(days=16),
        return_date=today - timedelta(days=17),
        status="returned",
        notes="Returned in excellent condition.",
        librarian_notes="Verified by Eleanor Vance at front desk."
    )

    rec_returned2 = models.BorrowingRecord(
        user_id=patron1.id,
        book_id=book_objects[7].id,  # Charlotte's Web
        borrow_date=today - timedelta(days=45),
        due_date=today - timedelta(days=31),
        return_date=today - timedelta(days=32),
        status="returned",
        notes="Returned promptly.",
        librarian_notes="Verified return."
    )

    # Sarah Chen's borrowing
    rec_sarah = models.BorrowingRecord(
        user_id=patron2.id,
        book_id=book_objects[2].id,  # Designing Data-Intensive Applications
        borrow_date=today - timedelta(days=5),
        due_date=today + timedelta(days=9),
        status="borrowed",
        notes="Graduate thesis research."
    )

    db.add_all([rec_3_days, rec_tomorrow, rec_today, rec_overdue, rec_returned1, rec_returned2, rec_sarah])
    db.flush()

    # 4. Create Library Announcements
    announcements = [
        models.Announcement(
            title="Spring Reading Festival & Author Workshop",
            content="Join us this Saturday at 2:00 PM in the Main Auditorium for guest authors, book signings, and digital library tours. Free admission for all library members.",
            badge="Event",
            is_pinned=True
        ),
        models.Announcement(
            title="Extended Study Wing Hours for Exam Preparation",
            content="During midterm exam weeks, the Central Study Wing and Quiet Reading Room will remain open until 10:00 PM on weekdays with high-speed Wi-Fi and power outlets.",
            badge="Notice",
            is_pinned=True
        ),
        models.Announcement(
            title="New AI & Data Engineering Reference Section Open",
            content="We have introduced 40+ fresh titles covering Python, Machine Learning, Data Structures, and Cloud Computing on Aisle 3.",
            badge="Update",
            is_pinned=False
        )
    ]
    db.add_all(announcements)

    # 5. Create Sample Feedback Entries
    feedbacks = [
        models.Feedback(
            user_id=patron1.id,
            user_name="Alex Morgan",
            user_email="patron@libraryease.org",
            rating=5,
            category="Website Experience",
            comments="The AI book discovery feature helped me find the right beginner Python book immediately! Much easier than our old library catalog.",
            status="resolved",
            admin_response="Thank you Alex! We are thrilled to hear that the AI search is making your research easier.",
            response_date=datetime.utcnow() - timedelta(days=2)
        ),
        models.Feedback(
            user_id=patron2.id,
            user_name="Sarah Chen",
            user_email="sarah.chen@example.com",
            rating=4,
            category="Library Facilities",
            comments="Could we have more quiet power sockets near the 2nd floor window tables for laptop study?",
            status="under_review",
            admin_response="Noted with thanks. Our facilities maintenance team is installing 6 new multi-socket surge protectors this week.",
            response_date=datetime.utcnow() - timedelta(hours=14)
        ),
        models.Feedback(
            user_id=patron3.id,
            user_name="David Miller",
            user_email="david.miller@example.com",
            rating=5,
            category="Staff Support",
            comments="Librarian Eleanor was extremely helpful in recommending great history books for my high school research project.",
            status="resolved",
            admin_response="We appreciate your kind words, David! Our staff is always here to assist your learning journey.",
            response_date=datetime.utcnow() - timedelta(days=1)
        )
    ]
    db.add_all(feedbacks)

    # 6. Create Book Requests
    book_reqs = [
        models.BookRequest(
            user_id=patron2.id,
            user_name="Sarah Chen",
            user_email="sarah.chen@example.com",
            book_title="Fluent Python: Clear, Concise, and Effective Programming (2nd Edition)",
            author="Luciano Ramalho",
            category="Computer Science",
            reason="Needed for deep understanding of Python concurrency, generators, and data models.",
            status="approved",
            librarian_response="Order placed with university distributor. Expected arrival in 2 weeks."
        ),
        models.BookRequest(
            user_id=patron1.id,
            user_name="Alex Morgan",
            user_email="patron@libraryease.org",
            book_title="Grokking Algorithms",
            author="Aditya Bhargava",
            category="Computer Science",
            reason="Illustrated guide to algorithms for visual learners.",
            status="pending"
        )
    ]
    db.add_all(book_reqs)

    db.commit()
    print("Database seeding completed successfully!")


def seed_libraries(db: Session):
    """
    Populate the libraries SQL table with Mumbai library records.
    Idempotent: skips if records already exist.
    """
    if db.query(models.Library).count() > 0:
        return

    import json
    from main import MUMBAI_LIBRARIES_DATA

    print("Seeding Mumbai libraries into SQL table...")
    library_records = []
    for lib in MUMBAI_LIBRARIES_DATA:
        coords = lib.get("coordinates") or {}
        map_pos = lib.get("mapPosition") or {}
        rec = models.Library(
            id=lib["id"],
            name=lib["name"],
            area=lib.get("area", ""),
            locality=lib.get("locality", ""),
            region=lib.get("region", "Mumbai"),
            city=lib.get("city", "Mumbai"),
            state=lib.get("state", "Maharashtra"),
            country=lib.get("country", "India"),
            pincode=lib.get("pincode", ""),
            address=lib.get("address", ""),
            nearest_transit=lib.get("nearestTransit", ""),
            phone=lib.get("phone", ""),
            email=lib.get("email", ""),
            website=lib.get("website", ""),
            established_year=lib.get("establishedYear"),
            is_flagship=lib.get("isFlagship", False),
            is_verified=lib.get("isVerified", False),
            verification_status=lib.get("verificationStatus", ""),
            access_type=lib.get("accessType", ""),
            access_note=lib.get("accessNote", ""),
            supervisor=lib.get("supervisor", ""),
            hours_weekdays=lib.get("hours", {}).get("weekdays", ""),
            hours_saturday=lib.get("hours", {}).get("saturday", ""),
            hours_sunday=lib.get("hours", {}).get("sunday", ""),
            services_json=json.dumps(lib.get("services", [])),
            accessibility_json=json.dumps(lib.get("accessibility", [])),
            map_top=str(map_pos.get("top", "50%")),
            map_left=str(map_pos.get("left", "50%")),
            latitude=str(coords.get("lat", "")),
            longitude=str(coords.get("lng", "")),
            map_search_query=f"{lib['name']} {lib.get('area', '')} Mumbai"
        )
        library_records.append(rec)

    db.add_all(library_records)
    db.commit()
    print(f"Successfully seeded {len(library_records)} Mumbai library records into the libraries SQL table.")
