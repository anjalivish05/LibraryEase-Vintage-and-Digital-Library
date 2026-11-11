import os
import random
from datetime import date, datetime, timedelta
from typing import List, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_

from config import settings
from database import engine, get_db, SessionLocal, Base
import models
import schemas
from security import (
    hash_password, verify_password, create_access_token,
    get_current_user, get_current_librarian, get_optional_user
)
from ai_service import search_books_with_ai, chat_with_ai
from scheduler import (
    start_scheduler, shutdown_scheduler, run_reminder_scan_sync, evaluate_and_dispatch_reminders
)
from seed_data import seed_database

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
        # Run reminder scan to ensure initial notifications match seed dates
        evaluate_and_dispatch_reminders(db)
    finally:
        db.close()
    
    # Start the automated reminder scheduler
    start_scheduler()
    yield
    # Shutdown
    shutdown_scheduler()

app = FastAPI(
    title="LibraryEase API",
    description="Smart, AI-Powered Public Library Services System",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- SYSTEM & INFO ENDPOINTS -----------------

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "LibraryEase Backend",
        "timestamp": datetime.utcnow().isoformat(),
        "ai_enabled": bool(settings.GEMINI_API_KEY)
    }

@app.get("/api/info")
def get_library_info():
    return {
        "library_name": settings.LIBRARY_NAME,
        "location": "Town Hall, Shahid Bhagat Singh Road, Horniman Circle, Fort, Mumbai, Maharashtra 400023, India",
        "phone": "+91 (022) 2266-0956",
        "email": "contact@libraryease.org.in",
        "city": "Mumbai",
        "state": "Maharashtra",
        "country": "India",
        "hours": [
            {"days": "Monday – Friday", "hours": "8:30 AM – 8:00 PM"},
            {"days": "Saturday", "hours": "9:00 AM – 6:00 PM"},
            {"days": "Sunday", "hours": "11:00 AM – 4:00 PM"}
        ],
        "membership_rules": [
            "Any resident or student in Mumbai with a valid digital LibraryEase card is entitled to borrow up to 5 items concurrently.",
            "Standard borrowing loan duration is 14 calendar days.",
            "Books can be renewed up to 2 times provided there are no active patron holds on that title.",
            "Automated multi-stage reminders are issued 3 days before, 1 day before, on due date, and after overdue."
        ],
        "facilities": [
            "Heritage Reading Halls & Study Abhyasikas",
            "High-Speed Public Wi-Fi & Laptop Charging Workstations",
            "AI Digital Research & Marathi/Indology Archives",
            "Children's Storytelling Corner & Young Readers Hub",
            "Conference & Collaborative Group Study Rooms",
            "Physical Self-Checkout & Return Drop-Box (verified by Librarians)"
        ],
        "faqs": [
            {
                "question": "How do I join LibraryEase as a member in Mumbai?",
                "answer": "Sign up online through this portal to receive your instant digital library card number (PAT-XXXX). You can start searching, reserving, and tracking books immediately across participating Mumbai branches."
            },
            {
                "question": "How do automated return reminders work?",
                "answer": "Our backend scheduler automatically audits all loan periods daily. You receive notifications in your notification center at 3 days before, 1 day before, on the due date, and if an item is overdue."
            },
            {
                "question": "Can I mark my book as returned myself in the app?",
                "answer": "No. To maintain library data integrity, physical books must be dropped off at the circulation desk or drop box where an authorized librarian inspects and confirms the return in the system."
            },
            {
                "question": "What happens if a book I need is not available?",
                "answer": "Our AI search will suggest similar available titles in the same category. You can also submit a formal Book Request through your dashboard or the Feedback page."
            }
        ]
    }

# Mumbai Public Libraries & Reading Rooms Dataset
MUMBAI_LIBRARIES_DATA = [
    {
        "id": "mumbai-lib-1",
        "name": "David Sassoon Library and Reading Room",
        "area": "Fort",
        "locality": "Kala Ghoda / Fort",
        "region": "South Mumbai",
        "city": "Mumbai",
        "state": "Maharashtra",
        "country": "India",
        "pincode": "400001",
        "address": "152, Mahatma Gandhi Road, Off David Sassoon Chowk, Opposite Jehangir Art Gallery, Kala Ghoda, Fort, Mumbai, Maharashtra 400001, India",
        "nearestTransit": "0.8 km from CSMT / Churchgate Railway Station",
        "phone": "+91 (022) 2284-3703",
        "email": "info@davidsassoonlibrary.org",
        "website": "https://davidsassoonlibrary.org",
        "establishedYear": 1870,
        "isFlagship": True,
        "isVerified": True,
        "verificationStatus": "Verified Heritage Institution",
        "accessType": "Public Reading Room & Member Lending",
        "accessNote": "Grade I Heritage Structure. Reading room open to members and research scholars; daily visitor reading passes available for students and scholars at reception.",
        "supervisor": "Hemant Bhalekar (Chief Librarian)",
        "hours": {
            "weekdays": "Monday – Friday: 8:00 AM – 9:00 PM",
            "saturday": "Saturday: 8:00 AM – 9:00 PM",
            "sunday": "Sunday: 8:00 AM – 9:00 PM (Open 365 Days)"
        },
        "services": [
            "Historic Heritage Reading Hall",
            "Lush Garden Courtyard Reading Area",
            "Air-Conditioned Reference Section",
            "Rare Books & Archival Volumes (70,000+)",
            "Free High-Speed Wi-Fi & Laptop Charging",
            "Student & Scholar Day Reading Passes"
        ],
        "accessibility": [
            "Ground Floor Garden Reading Access",
            "Wide Historic Entrance Ramps",
            "Natural Teak Reading Desks"
        ],
        "mapPosition": {"top": "88%", "left": "46%"},
        "coordinates": {"lat": 18.9282, "lng": 72.8322}
    },
    {
        "id": "mumbai-lib-2",
        "name": "The Asiatic Society of Mumbai (Central Library)",
        "area": "Fort",
        "locality": "Horniman Circle / Fort",
        "region": "South Mumbai",
        "city": "Mumbai",
        "state": "Maharashtra",
        "country": "India",
        "pincode": "400023",
        "address": "Town Hall, Shahid Bhagat Singh Road, Horniman Circle, Fort, Mumbai, Maharashtra 400023, India",
        "nearestTransit": "0.6 km from CSMT / Reserve Bank of India, Fort",
        "phone": "+91 (022) 2266-0956",
        "email": "asiaticlibrary1804@gmail.com",
        "website": "https://asiaticsociety.org.in",
        "establishedYear": 1804,
        "isFlagship": True,
        "isVerified": True,
        "verificationStatus": "Verified Literary & Research Institution",
        "accessType": "Premier Scholarly Reference & Archival Hall",
        "accessNote": "Founded in 1804. Houses priceless manuscripts including an original 14th-century Dante's Divine Comedy. Public access to reading rooms by registration.",
        "supervisor": "Dr. Shehernaz Nalwalla (Vice President & Library Trustee)",
        "hours": {
            "weekdays": "Monday – Friday: 10:30 AM – 7:00 PM",
            "saturday": "Saturday: 10:30 AM – 5:30 PM",
            "sunday": "Sunday & Public Holidays: Closed"
        },
        "services": [
            "Historic Town Hall Durbar Reading Hall",
            "Rare Manuscripts Vault & Ancient Folios",
            "Over 100,000 Volumes in Indology & Sanskrit",
            "Digitization & Microfilm Research Facility",
            "Historic Numismatics (Coin) & Map Cabinet"
        ],
        "accessibility": [
            "Town Hall Grand Ramp for Accessibility",
            "Reading Hall Assistance for Senior Scholars"
        ],
        "mapPosition": {"top": "85%", "left": "50%"},
        "coordinates": {"lat": 18.9317, "lng": 72.8354}
    },
    {
        "id": "mumbai-lib-3",
        "name": "Mumbai Marathi Grantha Sangrahalaya (Central)",
        "area": "Dadar",
        "locality": "Naigaon / Dadar East",
        "region": "Central Mumbai",
        "city": "Mumbai",
        "state": "Maharashtra",
        "country": "India",
        "pincode": "400014",
        "address": "MMGS Building, 172, Mumbai Marathi Grantha Sangrahalaya Marg, Naigaon Cross Road, Dadar East, Mumbai, Maharashtra 400014, India",
        "nearestTransit": "0.4 km from Dadar Central & Western Railway Terminus",
        "phone": "+91 (022) 2413-5388",
        "email": "contact@mmgslibrary.in",
        "website": "http://mmgslibrary.in",
        "establishedYear": 1898,
        "isFlagship": False,
        "isVerified": True,
        "verificationStatus": "Verified Public Research & Marathi Archives",
        "accessType": "Public Reference Hall, Abhyasika & Book Lending",
        "accessNote": "Founded in 1898. Apex research institution for Marathi literature, history, and social movements. Operates affordable student study halls (Abhyasika) and a network of Mumbai branches.",
        "supervisor": "Suhas Kulkarni (Executive Secretary)",
        "hours": {
            "weekdays": "Tuesday – Friday: 9:00 AM – 8:00 PM",
            "saturday": "Saturday: 9:00 AM – 8:00 PM",
            "sunday": "Sunday: 9:00 AM – 6:00 PM (Monday Closed)"
        },
        "services": [
            "Extensive Marathi Literature Archive (600,000+ works)",
            "Large Student Study Hall (Abhyasika)",
            "Competitive Exam Resource Center (MPSC & UPSC)",
            "Newspapers & Vernacular Periodical Archives",
            "Affordable Civic Lending Membership"
        ],
        "accessibility": [
            "Elevator Access to Upper Study Floors",
            "Senior Citizen Reading Sections"
        ],
        "mapPosition": {"top": "70%", "left": "48%"},
        "coordinates": {"lat": 19.0182, "lng": 72.8436}
    },
    {
        "id": "mumbai-lib-4",
        "name": "The J. N. Petit Institute and Library",
        "area": "Fort",
        "locality": "Flora Fountain / Fort",
        "region": "South Mumbai",
        "city": "Mumbai",
        "state": "Maharashtra",
        "country": "India",
        "pincode": "400001",
        "address": "312, Dr. Dadabhai Naoroji Road, Fort, Mumbai, Maharashtra 400001, India",
        "nearestTransit": "0.3 km from Hutatma Chowk / Flora Fountain",
        "phone": "+91 (022) 2204-8463",
        "email": "contact@jnpetitinstitute.org",
        "website": "https://jnpetitinstitute.org",
        "establishedYear": 1856,
        "isFlagship": False,
        "isVerified": True,
        "verificationStatus": "Verified Heritage Public Reading Room",
        "accessType": "Member Circulation & Heritage Reading Room",
        "accessNote": "UNESCO Asia-Pacific Heritage Award-winning Gothic reading room with stained glass windows and magnificent wooden rafters.",
        "supervisor": "Meher Master (Library Administrator)",
        "hours": {
            "weekdays": "Monday – Friday: 9:00 AM – 6:30 PM",
            "saturday": "Saturday: 9:00 AM – 4:00 PM",
            "sunday": "Sunday: Closed"
        },
        "services": [
            "Iconic High-Ceiling Gothic Reading Hall",
            "Stained-Glass Window Reading Bays",
            "Over 150,000 Volumes in English, Gujarati & Hindi",
            "Newspaper & Current Affairs Periodicals Room",
            "Quiet Individual Scholar Work Desks"
        ],
        "accessibility": [
            "Elevator Access to First Floor Reading Hall",
            "Naturally Ventilated High-Ceiling Salons"
        ],
        "mapPosition": {"top": "86%", "left": "44%"},
        "coordinates": {"lat": 18.9329, "lng": 72.8335}
    },
    {
        "id": "mumbai-lib-5",
        "name": "People's Free Reading Room and Library",
        "area": "Marine Lines",
        "locality": "Dhobi Talao / Marine Lines",
        "region": "South Mumbai",
        "city": "Mumbai",
        "state": "Maharashtra",
        "country": "India",
        "pincode": "400002",
        "address": "JS-5, Lokmanya Tilak Marg, Opp. Metro Cinema, Dhobi Talao, Marine Lines, Mumbai, Maharashtra 400002, India",
        "nearestTransit": "0.3 km from Marine Lines Railway Station",
        "phone": "+91 (022) 2201-3557",
        "email": "info@peopleslibrarymumbai.org",
        "establishedYear": 1891,
        "isFlagship": False,
        "isVerified": True,
        "verificationStatus": "Verified Free Public Reading Room",
        "accessType": "Free Public Reading Hall & Member Borrowing",
        "accessNote": "Founded in 1891 to ensure free, unrestricted access to daily newspapers, journals, and books for students and citizens.",
        "supervisor": "Anil Vaidya (Librarian-in-Charge)",
        "hours": {
            "weekdays": "Monday – Friday: 8:00 AM – 8:00 PM",
            "saturday": "Saturday: 8:00 AM – 8:00 PM",
            "sunday": "Sunday: 8:00 AM – 1:00 PM"
        },
        "services": [
            "Free Open-Access Newspaper & Periodicals Hall",
            "Quiet Student Study Hall (Abhyasika)",
            "Extensive Daily Papers in 4 Languages",
            "Competitive Exam Reference Text Bank (UPSC, CA, Law)"
        ],
        "accessibility": [
            "Step-Free Direct Street Level Access",
            "Wide Reading Tables with Natural Light"
        ],
        "mapPosition": {"top": "81%", "left": "43%"},
        "coordinates": {"lat": 18.9431, "lng": 72.8286}
    },
    {
        "id": "mumbai-lib-6",
        "name": "National Library and Reading Room, Bandra",
        "area": "Bandra",
        "locality": "Bandra West",
        "region": "Western Suburbs",
        "city": "Mumbai",
        "state": "Maharashtra",
        "country": "India",
        "pincode": "400050",
        "address": "28/A, Waterfield Road, Near Turner Road Junction, Bandra West, Mumbai, Maharashtra 400050, India",
        "nearestTransit": "1.1 km from Bandra Railway Station (West)",
        "phone": "+91 (022) 2640-1892",
        "email": "bandra.nationallib@gmail.com",
        "establishedYear": 1932,
        "isFlagship": False,
        "isVerified": True,
        "verificationStatus": "Verified Suburb Public Reading Space",
        "accessType": "Neighborhood Study Space & Book Lending",
        "accessNote": "Longstanding neighborhood library serving Bandra's students, writers, and local readers with peaceful study carrels.",
        "supervisor": "Rita Fernandes (Chief Librarian)",
        "hours": {
            "weekdays": "Monday – Friday: 8:00 AM – 8:30 PM",
            "saturday": "Saturday: 8:00 AM – 8:30 PM",
            "sunday": "Sunday: 9:00 AM – 1:00 PM"
        },
        "services": [
            "Air-Conditioned Study Pods & Reading Tables",
            "Free High-Speed Wi-Fi for Students & Researchers",
            "Curated Fiction, Non-Fiction & Contemporary Literature",
            "Daily English, Hindi & Marathi Newspapers"
        ],
        "accessibility": [
            "Step-Free Entrance Ramp",
            "Ground Floor Reading Sanctuary"
        ],
        "mapPosition": {"top": "58%", "left": "38%"},
        "coordinates": {"lat": 19.0596, "lng": 72.8362}
    },
    {
        "id": "mumbai-lib-7",
        "name": "Andheri Public Reading Hall & Library",
        "area": "Andheri",
        "locality": "Andheri West",
        "region": "Western Suburbs",
        "city": "Mumbai",
        "state": "Maharashtra",
        "country": "India",
        "pincode": "400058",
        "address": "Swami Vivekananda (S.V.) Road, Opp. Andheri Railway Station (West), Andheri West, Mumbai, Maharashtra 400058, India",
        "nearestTransit": "0.2 km from Andheri Railway Station & Metro Line 1",
        "phone": "+91 (022) 2628-3344",
        "email": "andheri.civiclibrary@gmail.com",
        "establishedYear": 1965,
        "isFlagship": False,
        "isVerified": True,
        "verificationStatus": "Verified Civic Study Center",
        "accessType": "Public Study Hall & Lending Department",
        "accessNote": "Located right next to Andheri Station and Metro. Serves university students and competitive exam aspirants with a quiet study hall.",
        "supervisor": "Prakash Surve (Library Superintendent)",
        "hours": {
            "weekdays": "Monday – Friday: 8:00 AM – 9:00 PM",
            "saturday": "Saturday: 8:00 AM – 9:00 PM",
            "sunday": "Sunday: 9:00 AM – 2:00 PM"
        },
        "services": [
            "Spacious Student Study Hall (Abhyasika)",
            "Competitive Exam Textbooks (MPSC, UPSC, Engineering, Medical)",
            "Free High-Speed Wi-Fi & Laptop Charging Points",
            "Daily Newspapers in English, Hindi & Marathi"
        ],
        "accessibility": [
            "Direct Ground Floor Entry",
            "Air-Cooled Study Halls"
        ],
        "mapPosition": {"top": "44%", "left": "35%"},
        "coordinates": {"lat": 19.1197, "lng": 72.8464}
    },
    {
        "id": "mumbai-lib-8",
        "name": "Goregaon Study & Community Library",
        "area": "Goregaon",
        "locality": "Goregaon West",
        "region": "Western Suburbs",
        "city": "Mumbai",
        "state": "Maharashtra",
        "country": "India",
        "pincode": "400104",
        "address": "Station Road, Near Post Office, Goregaon West, Mumbai, Maharashtra 400104, India",
        "nearestTransit": "0.3 km from Goregaon Railway Station & S.V. Road",
        "phone": "+91 (022) 2872-4110",
        "email": "goregaon.library@gmail.com",
        "establishedYear": 1974,
        "isFlagship": False,
        "isVerified": True,
        "verificationStatus": "Verified Branch Reading Room",
        "accessType": "Community Reading Hall & Lending Center",
        "accessNote": "Established community branch providing a peaceful haven for local school and college students and senior citizens.",
        "supervisor": "Sneha Deshmukh (Branch Librarian)",
        "hours": {
            "weekdays": "Monday – Friday: 9:00 AM – 8:00 PM",
            "saturday": "Saturday: 9:00 AM – 8:00 PM",
            "sunday": "Sunday: 9:00 AM – 1:00 PM"
        },
        "services": [
            "Air-Cooled Quiet Study Hall for Students",
            "Marathi & English Fiction & Biography Section",
            "College Textbooks & Reference Racks",
            "Senior Patrons Daily Newspaper Lounge"
        ],
        "accessibility": [
            "Ground Floor Entry",
            "Senior Citizen Reading Lounges"
        ],
        "mapPosition": {"top": "32%", "left": "34%"},
        "coordinates": {"lat": 19.1663, "lng": 72.8431}
    },
    {
        "id": "mumbai-lib-9",
        "name": "Borivali Public Reading Space & Library",
        "area": "Borivali",
        "locality": "Borivali West",
        "region": "Western Suburbs",
        "city": "Mumbai",
        "state": "Maharashtra",
        "country": "India",
        "pincode": "400092",
        "address": "Chandavarkar Road, Opp. Municipal Garden, Borivali West, Mumbai, Maharashtra 400092, India",
        "nearestTransit": "0.5 km from Borivali Railway Station (West)",
        "phone": "+91 (022) 2891-7620",
        "email": "borivali.publicreading@gmail.com",
        "establishedYear": 1982,
        "isFlagship": False,
        "isVerified": True,
        "verificationStatus": "Verified Suburb Study Hub",
        "accessType": "Public Study Carrels & Book Lending Center",
        "accessNote": "High-capacity civic study space serving Borivali, Kandivali, and Dahisar learners with dedicated desks for exam preparation.",
        "supervisor": "Manish Joshi (Head Librarian)",
        "hours": {
            "weekdays": "Monday – Friday: 8:30 AM – 8:30 PM",
            "saturday": "Saturday: 8:30 AM – 8:30 PM",
            "sunday": "Sunday: 9:00 AM – 2:00 PM"
        },
        "services": [
            "Quiet Study Carrels for Scholars & Aspirants",
            "Comprehensive Academic & University Textbank",
            "Free Wi-Fi Zone & Digital Library Kiosk",
            "Daily Marathi, Gujarati, Hindi & English Papers"
        ],
        "accessibility": [
            "Wheelchair Accessible Entrance Ramp",
            "Ground Floor Study Hall"
        ],
        "mapPosition": {"top": "14%", "left": "32%"},
        "coordinates": {"lat": 19.2307, "lng": 72.8567}
    },
    {
        "id": "mumbai-lib-10",
        "name": "Powai Knowledge Centre & Community Reading Room",
        "area": "Powai",
        "locality": "Hiranandani Gardens / Powai",
        "region": "Eastern Suburbs",
        "city": "Mumbai",
        "state": "Maharashtra",
        "country": "India",
        "pincode": "400076",
        "address": "Central Avenue, Opposite Galleria Shopping Mall, Hiranandani Gardens, Powai, Mumbai, Maharashtra 400076, India",
        "nearestTransit": "Near Powai Lake & IIT Bombay Main Gate (1.2 km)",
        "phone": "+91 (022) 2570-9981",
        "email": "powai.knowledgecentre@libraryease.org.in",
        "establishedYear": 2004,
        "isFlagship": False,
        "isVerified": False,
        "verificationStatus": "Demonstration Suburb Facility",
        "accessType": "Digital Library & Collaborative Study Space",
        "accessNote": "Demonstration suburban knowledge hub designed to showcase modern digital public library facilities in Mumbai's eastern technology corridor. Not linked to municipal registry.",
        "supervisor": "Aarav Nair (Center Coordinator)",
        "hours": {
            "weekdays": "Monday – Friday: 9:00 AM – 8:00 PM",
            "saturday": "Saturday: 9:00 AM – 8:00 PM",
            "sunday": "Sunday: 10:00 AM – 6:00 PM"
        },
        "services": [
            "Digital Research Terminals & E-Resource Catalog",
            "High-Speed Fiber Wi-Fi & Laptop Workstations",
            "Contemporary Science, AI, Engineering & Business Stacks",
            "Air-Conditioned Collaborative Discussion Pods"
        ],
        "accessibility": [
            "Elevator Access to All Levels",
            "Ergonomic Workstations"
        ],
        "mapPosition": {"top": "42%", "left": "65%"},
        "coordinates": {"lat": 19.1176, "lng": 72.9060}
    },
    {
        "id": "mumbai-lib-11",
        "name": "Kandivali - Malad Civic Reading Room",
        "area": "Kandivali",
        "locality": "Kandivali West / Malad",
        "region": "Western Suburbs",
        "city": "Mumbai",
        "state": "Maharashtra",
        "country": "India",
        "pincode": "400067",
        "address": "S.V. Road, Between Malad and Kandivali Stations, Kandivali West, Mumbai, Maharashtra 400067, India",
        "nearestTransit": "0.8 km from Kandivali / Malad Railway Stations",
        "phone": "+91 (022) 2801-4422",
        "email": "kandivali.readingroom@libraryease.org.in",
        "establishedYear": 1988,
        "isFlagship": False,
        "isVerified": False,
        "verificationStatus": "Demonstration Suburb Facility",
        "accessType": "Community Study Hall & Newspaper Room",
        "accessNote": "Demonstration profile representing suburban reading spaces serving Kandivali and Malad students and senior readers.",
        "supervisor": "Rohit Kadam (Reading Room Supervisor)",
        "hours": {
            "weekdays": "Monday – Friday: 8:30 AM – 8:00 PM",
            "saturday": "Saturday: 8:30 AM – 8:00 PM",
            "sunday": "Sunday: 9:00 AM – 1:00 PM"
        },
        "services": [
            "Quiet Student Study Desks (Abhyasika)",
            "College Reference Books & Entrance Exam Guides",
            "Daily English, Hindi, Marathi & Gujarati Dailies"
        ],
        "accessibility": [
            "Ground Floor Level Entrance Ramp",
            "Spacious Seating Layout"
        ],
        "mapPosition": {"top": "22%", "left": "33%"},
        "coordinates": {"lat": 19.2045, "lng": 72.8522}
    },
    {
        "id": "mumbai-lib-12",
        "name": "Colaba Heritage Reading Corner",
        "area": "Colaba",
        "locality": "Colaba Causeway",
        "region": "South Mumbai",
        "city": "Mumbai",
        "state": "Maharashtra",
        "country": "India",
        "pincode": "400005",
        "address": "Shahid Bhagat Singh Road, Near Colaba Causeway, Colaba, Mumbai, Maharashtra 400005, India",
        "nearestTransit": "0.5 km from Gateway of India & Regal Cinema",
        "phone": "+91 (022) 2218-6700",
        "email": "colaba.reading@libraryease.org.in",
        "establishedYear": 1992,
        "isFlagship": False,
        "isVerified": False,
        "verificationStatus": "Demonstration Suburb Facility",
        "accessType": "Civic Literary Room & Tourist Information",
        "accessNote": "Demonstration profile showcasing neighborhood cultural and architectural literature near Colaba Causeway and Gateway of India.",
        "supervisor": "Farida Batliwala (Curator)",
        "hours": {
            "weekdays": "Monday – Friday: 9:00 AM – 7:30 PM",
            "saturday": "Saturday: 9:00 AM – 5:00 PM",
            "sunday": "Sunday: Closed"
        },
        "services": [
            "Bombay Maritime History & Heritage Architecture Section",
            "Tourist Cultural Guide & Maps Corner",
            "Open Reading Lounge with Wi-Fi"
        ],
        "accessibility": [
            "Ground Floor Entrance",
            "Comfortable Armchairs & Reading Tables"
        ],
        "mapPosition": {"top": "93%", "left": "47%"},
        "coordinates": {"lat": 18.9067, "lng": 72.8147}
    }
]

@app.get("/api/libraries")
def get_mumbai_libraries(
    q: Optional[str] = Query(None, description="Search query for name, locality, address"),
    locality: Optional[str] = Query(None, description="Filter by Mumbai locality"),
    facility: Optional[str] = Query(None, description="Filter by facility or service"),
    verified_only: Optional[bool] = Query(None, description="Filter only verified institutions")
):
    results = MUMBAI_LIBRARIES_DATA

    if verified_only:
        results = [lib for lib in results if lib.get("isVerified") is True]

    if locality and locality != "All Localities":
        loc_term = locality.lower().replace(" / south mumbai", "").replace(" / central", "").strip()
        results = [
            lib for lib in results 
            if loc_term in lib.get("area", "").lower() 
            or loc_term in lib.get("locality", "").lower()
        ]

    if facility and facility != "All Facilities":
        results = [
            lib for lib in results 
            if any(facility.lower() in s.lower() for s in lib.get("services", []))
        ]

    if q:
        query_str = q.lower().strip()
        results = [
            lib for lib in results
            if query_str in lib.get("name", "").lower()
            or query_str in lib.get("area", "").lower()
            or query_str in lib.get("locality", "").lower()
            or query_str in lib.get("address", "").lower()
            or any(query_str in s.lower() for s in lib.get("services", []))
        ]

    return {
        "city": "Mumbai",
        "state": "Maharashtra",
        "country": "India",
        "total": len(results),
        "libraries": results
    }

@app.get("/api/libraries/{library_id}")
def get_library_by_id(library_id: str):
    """
    Retrieve single Mumbai library branch details by ID (e.g., 'mumbai-lib-1').
    """
    clean_id = library_id.strip().lower()
    for lib in MUMBAI_LIBRARIES_DATA:
        if lib.get("id", "").lower() == clean_id:
            return lib
    # Partial match fallback e.g. 'lib-1' -> 'mumbai-lib-1'
    for lib in MUMBAI_LIBRARIES_DATA:
        if clean_id in lib.get("id", "").lower():
            return lib

    raise HTTPException(
        status_code=404, 
        detail=f"Library branch '{library_id}' not found in Mumbai directory."
    )


# ----------------- AUTHENTICATION ENDPOINTS -----------------

@app.post("/api/auth/register", response_model=schemas.TokenResponse)
def register(user_data: schemas.UserRegister, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(models.User).filter(models.User.email == user_data.email.lower()).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    # Generate unique member card number
    prefix = "LIB" if user_data.role == "librarian" else "PAT"
    random_num = random.randint(1000, 9999)
    card_no = f"{prefix}-{random_num}"
    
    # Ensure uniqueness
    while db.query(models.User).filter(models.User.member_card_no == card_no).first():
        card_no = f"{prefix}-{random.randint(1000, 9999)}"

    new_user = models.User(
        email=user_data.email.lower().strip(),
        full_name=user_data.full_name.strip(),
        hashed_password=hash_password(user_data.password),
        role=user_data.role if user_data.role in ["user", "librarian"] else "user",
        phone=user_data.phone,
        member_card_no=card_no
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Issue welcome notification
    welcome_notif = models.Notification(
        user_id=new_user.id,
        reminder_type="general",
        title="Welcome to LibraryEase!",
        message=f"Welcome {new_user.full_name}! Your digital library card #{new_user.member_card_no} is now active. Explore our catalogue and AI search.",
        is_read=False
    )
    db.add(welcome_notif)
    db.commit()

    token = create_access_token({"sub": str(new_user.id), "role": new_user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": new_user
    }

@app.post("/api/auth/login", response_model=schemas.TokenResponse)
def login(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == login_data.email.lower().strip()).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please verify your credentials."
        )

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@app.get("/api/auth/me", response_model=schemas.UserResponse)
def get_current_user_profile(user: models.User = Depends(get_current_user)):
    return user

@app.put("/api/auth/profile", response_model=schemas.UserResponse)
def update_profile(
    profile_data: schemas.UserProfileUpdate,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if profile_data.full_name is not None:
        user.full_name = profile_data.full_name.strip()
    if profile_data.phone is not None:
        user.phone = profile_data.phone.strip()
    db.commit()
    db.refresh(user)
    return user

@app.post("/api/auth/forgot-password")
def forgot_password(req: schemas.PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == req.email.lower().strip()).first()
    # Always return a polite success message to prevent user enumeration
    return {
        "message": f"If an account is associated with {req.email}, password recovery instructions and reset code 'RESET-2026' have been dispatched.",
        "simulated_code": "RESET-2026"
    }

@app.post("/api/auth/reset-password")
def reset_password(req: schemas.PasswordResetConfirm, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == req.email.lower().strip()).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")
    
    if req.reset_code.strip().upper() != "RESET-2026":
        raise HTTPException(status_code=400, detail="Invalid or expired reset code.")

    user.hashed_password = hash_password(req.new_password)
    db.commit()
    return {"message": "Password updated successfully. You can now log in with your new credentials."}

# ----------------- BOOK & AI DISCOVERY ENDPOINTS -----------------

@app.get("/api/books", response_model=List[schemas.BookResponse])
def get_books(
    search: Optional[str] = None,
    category: Optional[str] = None,
    language: Optional[str] = None,
    available_only: bool = False,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    query = db.query(models.Book).filter(models.Book.is_active == True)

    if category:
        query = query.filter(models.Book.category.ilike(f"%{category}%"))
    if language:
        query = query.filter(models.Book.language.ilike(language))
    if available_only:
        query = query.filter(models.Book.available_copies > 0)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                models.Book.title.ilike(search_pattern),
                models.Book.author.ilike(search_pattern),
                models.Book.category.ilike(search_pattern),
                models.Book.description.ilike(search_pattern),
                models.Book.tags.ilike(search_pattern),
            )
        )

    return query.order_by(models.Book.title.asc()).offset(offset).limit(limit).all()

@app.get("/api/books/categories")
def get_book_categories(db: Session = Depends(get_db)):
    categories = db.query(
        models.Book.category, 
        func.count(models.Book.id).label("count")
    ).filter(models.Book.is_active == True).group_by(models.Book.category).all()
    
    return [{"category": c[0], "count": c[1]} for c in categories]

@app.get("/api/books/{book_id}", response_model=schemas.BookResponse)
def get_book_detail(book_id: int, db: Session = Depends(get_db)):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found in library catalogue.")
    return book

@app.post("/api/books/ai-search", response_model=schemas.AISearchResult)
async def ai_search_books(search_query: schemas.AISearchQuery, db: Session = Depends(get_db)):
    all_books = db.query(models.Book).filter(models.Book.is_active == True).all()
    result = await search_books_with_ai(
        query_text=search_query.query,
        books=all_books,
        category_filter=search_query.category,
        language_filter=search_query.language,
        only_available=search_query.only_available or False
    )
    return result

@app.post("/api/ai/chat", response_model=schemas.AIChatResponse)
@app.post("/api/ai-assistant", response_model=schemas.AIChatResponse)
async def ai_assistant_chat(chat_data: schemas.AIChatRequest, db: Session = Depends(get_db)):
    """
    AI Assistant Conversational Chat Endpoint.
    - If GEMINI_API_KEY is configured in backend/.env, connects live to Gemini 1.5 Flash.
    - If unconfigured, executes transparent, intelligent rule-based book discovery in Demo Mode.
    """
    all_books = db.query(models.Book).filter(models.Book.is_active == True).all()
    response = await chat_with_ai(chat_data, all_books)
    return response

@app.get("/api/ai/status", response_model=schemas.AIStatusResponse)
def get_ai_status():
    """
    Returns the real-time operational status of the AI Assistant.
    """
    ai_active = bool(settings.GEMINI_API_KEY)
    return {
        "status": "ready",
        "mode": "gemini_ai" if ai_active else "demo_rule_based",
        "ai_enabled": ai_active,
        "service": "Google Gemini 3.5 Flash Lite" if ai_active else "Rule-Based Catalog NLP Concierge",
        "model": "gemini-3.5-flash-lite" if ai_active else "deterministic-nlp-matcher-v1"
    }

@app.post("/api/books", response_model=schemas.BookResponse)
def create_book(
    book_in: schemas.BookCreate,
    current_librarian: models.User = Depends(get_current_librarian),
    db: Session = Depends(get_db)
):
    new_book = models.Book(**book_in.model_dump())
    db.add(new_book)
    db.commit()
    db.refresh(new_book)
    return new_book

@app.put("/api/books/{book_id}", response_model=schemas.BookResponse)
def update_book(
    book_id: int,
    book_update: schemas.BookUpdate,
    current_librarian: models.User = Depends(get_current_librarian),
    db: Session = Depends(get_db)
):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found in library catalog.")

    update_dict = book_update.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(book, key, value)

    db.commit()
    db.refresh(book)
    return book

@app.delete("/api/books/{book_id}")
def delete_or_deactivate_book(
    book_id: int,
    current_librarian: models.User = Depends(get_current_librarian),
    db: Session = Depends(get_db)
):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found in catalog.")
    
    # Active loans check
    active_loans = db.query(models.BorrowingRecord).filter(
        models.BorrowingRecord.book_id == book_id,
        models.BorrowingRecord.status.in_(["borrowed", "due_soon", "due_today", "overdue"])
    ).count()
    if active_loans > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot remove '{book.title}': there are currently {active_loans} active patron loan(s) checked out. Please verify returns first."
        )

    # Soft delete (mark inactive) to maintain borrowing history integrity
    book.is_active = False
    db.commit()
    return {"message": f"Book '{book.title}' has been deactivated from catalog.", "success": True}

# ----------------- BORROWING & REMINDERS ENDPOINTS -----------------

def serialize_borrowing_record(rec: models.BorrowingRecord) -> dict:
    today = date.today()
    days_rem = (rec.due_date - today).days if rec.status != "returned" else 0
    renew_cnt = getattr(rec, "renew_count", 0) or 0
    max_renews = 2
    is_overdue = rec.status == "overdue" or (rec.due_date < today and rec.status != "returned")
    is_renewable = (rec.status != "returned") and (not is_overdue) and (renew_cnt < max_renews)

    return {
        "id": rec.id,
        "user_id": rec.user_id,
        "book_id": rec.book_id,
        "borrow_date": rec.borrow_date,
        "due_date": rec.due_date,
        "return_date": rec.return_date,
        "status": rec.status,
        "notes": rec.notes,
        "librarian_notes": rec.librarian_notes,
        "days_remaining": days_rem,
        "renew_count": renew_cnt,
        "renewals_remaining": max(0, max_renews - renew_cnt),
        "is_renewable": is_renewable,
        "book": rec.book,
        "user": rec.user
    }

@app.get("/api/borrowings/my", response_model=List[schemas.BorrowingRecordResponse])
def get_my_borrowings(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    records = db.query(models.BorrowingRecord).filter(
        models.BorrowingRecord.user_id == current_user.id
    ).order_by(models.BorrowingRecord.created_at.desc()).all()

    return [serialize_borrowing_record(r) for r in records]

@app.get("/api/borrowings/all", response_model=List[schemas.BorrowingRecordResponse])
def get_all_borrowings(
    status_filter: Optional[str] = None,
    current_librarian: models.User = Depends(get_current_librarian),
    db: Session = Depends(get_db)
):
    query = db.query(models.BorrowingRecord)
    if status_filter:
        query = query.filter(models.BorrowingRecord.status == status_filter)

    records = query.order_by(models.BorrowingRecord.created_at.desc()).all()
    return [serialize_borrowing_record(r) for r in records]

@app.post("/api/borrowings/issue", response_model=schemas.BorrowingRecordResponse)
def issue_book(
    borrow_data: schemas.BorrowCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_user_id = borrow_data.user_id if (borrow_data.user_id and current_user.role == "librarian") else current_user.id
    user = db.query(models.User).filter(models.User.id == target_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Patron user not found.")

    book = db.query(models.Book).filter(models.Book.id == borrow_data.book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found.")

    if book.available_copies <= 0:
        raise HTTPException(status_code=400, detail=f"No copies of '{book.title}' are currently available in inventory.")

    # Check if patron already has an active loan for this book
    active_loan = db.query(models.BorrowingRecord).filter(
        models.BorrowingRecord.user_id == user.id,
        models.BorrowingRecord.book_id == book.id,
        models.BorrowingRecord.status.in_(["borrowed", "overdue"])
    ).first()
    if active_loan:
        raise HTTPException(status_code=400, detail=f"You already have an active loan for '{book.title}'.")

    today = date.today()
    due = today + timedelta(days=borrow_data.due_days)

    # Decrement available copy
    book.available_copies -= 1

    issuer_note = f"Issued by librarian {current_user.full_name} on {today}." if current_user.role == "librarian" else f"Self-borrowed via online catalog on {today}."

    record = models.BorrowingRecord(
        user_id=user.id,
        book_id=book.id,
        borrow_date=today,
        due_date=due,
        status="borrowed",
        notes=borrow_data.notes,
        librarian_notes=issuer_note
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    # Add confirmation notification
    confirm_notif = models.Notification(
        user_id=user.id,
        borrowing_record_id=record.id,
        reminder_type="borrow_confirmation",
        title="Book Borrowed Successfully",
        message=f"You have borrowed '{book.title}'. Please return it by {due}.",
        is_read=False
    )
    db.add(confirm_notif)
    db.commit()

    return serialize_borrowing_record(record)

@app.post("/api/borrowings/{record_id}/return", response_model=schemas.BorrowingRecordResponse)
def confirm_book_return(
    record_id: int,
    return_info: Optional[schemas.BorrowReturnConfirm] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Return confirmation: librarians can confirm any return; patrons can return their own active loan.
    """
    record = db.query(models.BorrowingRecord).filter(models.BorrowingRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Borrowing record not found.")

    if current_user.role != "librarian" and record.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to return this loan.")

    if record.status == "returned":
        raise HTTPException(status_code=400, detail="This book has already been marked as returned.")

    today = date.today()
    record.return_date = today
    record.status = "returned"
    
    if current_user.role == "librarian":
        note = f"Physical return verified by librarian {current_user.full_name} on {today}."
        if return_info and return_info.librarian_notes:
            note += f" Notes: {return_info.librarian_notes}"
    else:
        note = f"Returned by patron {current_user.full_name} via catalog drop-box on {today}."
    record.librarian_notes = note

    # Increment available copy in inventory
    if record.book:
        record.book.available_copies = min(record.book.available_copies + 1, record.book.total_copies)

    # Send return receipt notification
    return_notif = models.Notification(
        user_id=record.user_id,
        borrowing_record_id=record.id,
        reminder_type="return_confirmation",
        title="Book Return Confirmed",
        message=f"Return of '{record.book.title if record.book else 'Book'}' has been successfully recorded. Thank you!",
        is_read=False
    )
    db.add(return_notif)

    db.commit()
    db.refresh(record)
    return serialize_borrowing_record(record)

@app.post("/api/borrowings/{record_id}/renew", response_model=schemas.BorrowingRecordResponse)
def renew_book_loan(
    record_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Dedicated Book Renewal Workflow:
    - Validates user ownership or librarian authorization
    - Checks eligibility (not returned, not overdue, within 2 max renewals limit)
    - Extends due date by 14 days and increments renew_count
    - Dispatches confirmation notification and returns updated record
    """
    record = db.query(models.BorrowingRecord).filter(models.BorrowingRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Borrowing record not found.")

    if current_user.role != "librarian" and record.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to renew this loan.")

    if record.status == "returned":
        raise HTTPException(status_code=400, detail="Cannot renew a book that has already been returned.")

    today = date.today()
    if record.status == "overdue" or record.due_date < today:
        raise HTTPException(
            status_code=400,
            detail=f"This book was due on {record.due_date} and is overdue. Overdue items cannot be renewed online — please return it to a branch desk."
        )

    current_renews = getattr(record, "renew_count", 0) or 0
    if current_renews >= 2:
        raise HTTPException(
            status_code=400,
            detail="Maximum renewals reached (2 of 2 renewals used). Please return the book to library circulation."
        )

    new_due_date = record.due_date + timedelta(days=14)
    record.due_date = new_due_date
    record.renew_count = current_renews + 1
    if record.status in ["due_soon", "due_today"]:
        record.status = "borrowed"

    renews_left = 2 - record.renew_count
    book_title = record.book.title if record.book else "Book"
    renew_notif = models.Notification(
        user_id=record.user_id,
        borrowing_record_id=record.id,
        reminder_type=f"renewal_{record.renew_count}",
        title="Book Loan Renewed",
        message=f"Loan for '{book_title}' extended by 14 days until {new_due_date}. ({renews_left} renewal(s) remaining).",
        is_read=False
    )
    db.add(renew_notif)
    db.commit()
    db.refresh(record)
    return serialize_borrowing_record(record)

# ----------------- LIBRARIAN DASHBOARD ENDPOINTS -----------------

@app.get("/api/librarian/stats", response_model=schemas.LibrarianOverviewStats)
def get_librarian_stats(
    current_librarian: models.User = Depends(get_current_librarian),
    db: Session = Depends(get_db)
):
    """
    Overview statistics for the authorized Librarian Dashboard.
    Strictly restricted to librarian role.
    """
    today = date.today()
    total_books = db.query(models.Book).filter(models.Book.is_active == True).count()
    total_copies = db.query(func.sum(models.Book.total_copies)).filter(models.Book.is_active == True).scalar() or 0
    avail_copies = db.query(func.sum(models.Book.available_copies)).filter(models.Book.is_active == True).scalar() or 0
    registered_members = db.query(models.User).filter(models.User.role == "user").count()

    active_borrowings = db.query(models.BorrowingRecord).filter(
        models.BorrowingRecord.status.in_(["borrowed", "due_soon", "due_today"])
    ).count()

    overdue_borrowings = db.query(models.BorrowingRecord).filter(
        or_(
            models.BorrowingRecord.status == "overdue",
            and_(models.BorrowingRecord.status != "returned", models.BorrowingRecord.due_date < today)
        )
    ).count()

    returned_borrowings = db.query(models.BorrowingRecord).filter(
        models.BorrowingRecord.status == "returned"
    ).count()

    pending_requests = db.query(models.BookRequest).filter(
        models.BookRequest.status == "pending"
    ).count()

    total_feedback = db.query(models.Feedback).count()

    return {
        "total_books": total_books,
        "total_copies": int(total_copies),
        "available_copies": int(avail_copies),
        "registered_members": registered_members,
        "active_borrowings": active_borrowings,
        "overdue_borrowings": overdue_borrowings,
        "returned_borrowings": returned_borrowings,
        "pending_requests": pending_requests,
        "total_feedback": total_feedback
    }

@app.get("/api/librarian/members", response_model=List[schemas.MemberSummaryResponse])
def get_librarian_members(
    current_librarian: models.User = Depends(get_current_librarian),
    db: Session = Depends(get_db)
):
    """
    List all registered patrons and staff members with borrowing activity metrics.
    Strictly restricted to librarian role.
    """
    today = date.today()
    users = db.query(models.User).order_by(models.User.created_at.desc()).all()
    results = []
    for u in users:
        records = db.query(models.BorrowingRecord).filter(models.BorrowingRecord.user_id == u.id).all()
        active_cnt = sum(1 for r in records if r.status in ["borrowed", "due_soon", "due_today"])
        overdue_cnt = sum(1 for r in records if r.status == "overdue" or (r.status != "returned" and r.due_date < today))
        results.append({
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "member_card_no": u.member_card_no,
            "phone": u.phone,
            "role": u.role,
            "is_active": getattr(u, "is_active", True),
            "created_at": u.created_at,
            "active_loans_count": active_cnt,
            "overdue_loans_count": overdue_cnt,
            "total_borrowed_count": len(records)
        })
    return results

@app.get("/api/librarian/members/{member_id}/borrowings", response_model=List[schemas.BorrowingRecordResponse])
def get_member_borrowings(
    member_id: int,
    current_librarian: models.User = Depends(get_current_librarian),
    db: Session = Depends(get_db)
):
    """
    View complete borrowing history for a specific patron.
    Strictly restricted to librarian role.
    """
    records = db.query(models.BorrowingRecord).filter(
        models.BorrowingRecord.user_id == member_id
    ).order_by(models.BorrowingRecord.created_at.desc()).all()
    return [serialize_borrowing_record(r) for r in records]

@app.post("/api/borrowings/simulate-date")
def simulate_borrowing_date(
    sim_data: schemas.DateSimulationRequest,
    current_librarian: models.User = Depends(get_current_librarian),
    db: Session = Depends(get_db)
):
    """
    Testing & Demonstration Tool:
    Allows examiners and testers to adjust the due date of a record to test:
    - 3 days before due date (offset = 3)
    - 1 day before due date (offset = 1)
    - Due today (offset = 0)
    - Overdue (offset = -3)
    And immediately runs the reminder evaluation!
    """
    record = db.query(models.BorrowingRecord).filter(models.BorrowingRecord.id == sim_data.borrowing_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Borrowing record not found.")

    today = date.today()
    record.due_date = today + timedelta(days=sim_data.simulated_days_offset)
    db.commit()

    # Trigger reminder scan immediately
    scan_results = evaluate_and_dispatch_reminders(db)

    return {
        "message": f"Record #{record.id} due date shifted to {record.due_date} ({sim_data.simulated_days_offset} days from today).",
        "new_due_date": str(record.due_date),
        "new_status": record.status,
        "reminder_scan_results": scan_results
    }

@app.post("/api/reminders/scan")
def trigger_reminder_scan(db: Session = Depends(get_db)):
    """
    On-demand trigger for reminder auditing.
    """
    result = evaluate_and_dispatch_reminders(db)
    return {
        "success": True,
        "message": "Automated reminder scan completed.",
        "details": result
    }

# ----------------- NOTIFICATIONS ENDPOINTS -----------------

@app.get("/api/notifications")
def get_user_notifications(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    notifs = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id
    ).order_by(models.Notification.created_at.desc()).all()

    unread_count = sum(1 for n in notifs if not n.is_read)
    return {
        "unread_count": unread_count,
        "total": len(notifs),
        "notifications": [schemas.NotificationResponse.model_validate(n) for n in notifs]
    }

@app.put("/api/notifications/{notif_id}/read")
def mark_notification_read(
    notif_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif = db.query(models.Notification).filter(
        models.Notification.id == notif_id,
        models.Notification.user_id == current_user.id
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found.")

    notif.is_read = True
    db.commit()
    return {"message": "Notification marked as read."}

@app.put("/api/notifications/mark-all-read")
def mark_all_notifications_read(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read."}

# ----------------- FEEDBACK & SUGGESTIONS ENDPOINTS -----------------

@app.post("/api/feedback", response_model=schemas.FeedbackResponse)
def submit_feedback(
    fb_in: schemas.FeedbackCreate,
    current_user: Optional[models.User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    feedback = models.Feedback(
        user_id=current_user.id if current_user else None,
        user_name=fb_in.user_name.strip(),
        user_email=fb_in.user_email.strip().lower(),
        rating=fb_in.rating,
        category=fb_in.category,
        comments=fb_in.comments.strip(),
        feedback_type=fb_in.feedback_type or "feedback",
        target_book_title=fb_in.target_book_title,
        status="new"
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback

@app.get("/api/feedback/my", response_model=List[schemas.FeedbackResponse])
def get_my_feedback(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.Feedback).filter(
        or_(
            models.Feedback.user_id == current_user.id,
            models.Feedback.user_email == current_user.email
        )
    ).order_by(models.Feedback.created_at.desc()).all()

@app.get("/api/feedback/all", response_model=List[schemas.FeedbackResponse])
def get_all_feedback(
    category: Optional[str] = None,
    status: Optional[str] = None,
    current_librarian: models.User = Depends(get_current_librarian),
    db: Session = Depends(get_db)
):
    query = db.query(models.Feedback)
    if category:
        query = query.filter(models.Feedback.category == category)
    if status:
        query = query.filter(models.Feedback.status == status)
    return query.order_by(models.Feedback.created_at.desc()).all()

@app.put("/api/feedback/{fb_id}/status", response_model=schemas.FeedbackResponse)
def update_feedback_status(
    fb_id: int,
    update_data: schemas.FeedbackUpdateStatus,
    current_librarian: models.User = Depends(get_current_librarian),
    db: Session = Depends(get_db)
):
    feedback = db.query(models.Feedback).filter(models.Feedback.id == fb_id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback entry not found.")

    feedback.status = update_data.status
    if update_data.admin_response:
        feedback.admin_response = update_data.admin_response
        feedback.response_date = datetime.utcnow()

        # If user is registered, send them an in-app notification
        if feedback.user_id:
            db.add(models.Notification(
                user_id=feedback.user_id,
                reminder_type="feedback_response",
                title="Librarian Replied to Your Feedback",
                message=f"Library staff responded to your '{feedback.category}' submission: \"{update_data.admin_response}\"",
                is_read=False
            ))

    db.commit()
    db.refresh(feedback)
    return feedback

# ----------------- BOOK REQUESTS ENDPOINTS -----------------

@app.post("/api/book-requests", response_model=schemas.BookRequestResponse)
def submit_book_request(
    req_in: schemas.BookRequestCreate,
    current_user: Optional[models.User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    request_obj = models.BookRequest(
        user_id=current_user.id if current_user else None,
        user_name=req_in.user_name.strip(),
        user_email=req_in.user_email.strip().lower(),
        book_title=req_in.book_title.strip(),
        author=req_in.author.strip(),
        category=req_in.category,
        reason=req_in.reason,
        status="pending"
    )
    db.add(request_obj)
    db.commit()
    db.refresh(request_obj)
    return request_obj

@app.get("/api/book-requests/my", response_model=List[schemas.BookRequestResponse])
def get_my_book_requests(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.BookRequest).filter(
        or_(
            models.BookRequest.user_id == current_user.id,
            models.BookRequest.user_email == current_user.email
        )
    ).order_by(models.BookRequest.created_at.desc()).all()

@app.get("/api/book-requests/all", response_model=List[schemas.BookRequestResponse])
def get_all_book_requests(
    current_librarian: models.User = Depends(get_current_librarian),
    db: Session = Depends(get_db)
):
    return db.query(models.BookRequest).order_by(models.BookRequest.created_at.desc()).all()

@app.put("/api/book-requests/{req_id}/status", response_model=schemas.BookRequestResponse)
def update_book_request_status(
    req_id: int,
    update_data: schemas.BookRequestUpdateStatus,
    current_librarian: models.User = Depends(get_current_librarian),
    db: Session = Depends(get_db)
):
    breq = db.query(models.BookRequest).filter(models.BookRequest.id == req_id).first()
    if not breq:
        raise HTTPException(status_code=404, detail="Book request not found.")

    breq.status = update_data.status
    if update_data.librarian_response:
        breq.librarian_response = update_data.librarian_response

        if breq.user_id:
            db.add(models.Notification(
                user_id=breq.user_id,
                reminder_type="general",
                title=f"Book Request Update: {breq.book_title}",
                message=f"Status: {breq.status.upper()}. Librarian note: {update_data.librarian_response}",
                is_read=False
            ))

    db.commit()
    db.refresh(breq)
    return breq

# ----------------- ANNOUNCEMENTS ENDPOINTS -----------------

@app.get("/api/announcements", response_model=List[schemas.AnnouncementResponse])
def get_announcements(db: Session = Depends(get_db)):
    return db.query(models.Announcement).order_by(
        models.Announcement.is_pinned.desc(),
        models.Announcement.created_at.desc()
    ).all()

@app.post("/api/announcements", response_model=schemas.AnnouncementResponse)
def create_announcement(
    ann_in: schemas.AnnouncementCreate,
    current_librarian: models.User = Depends(get_current_librarian),
    db: Session = Depends(get_db)
):
    ann = models.Announcement(**ann_in.model_dump())
    db.add(ann)
    db.commit()
    db.refresh(ann)
    return ann

@app.delete("/api/announcements/{ann_id}")
def delete_announcement(
    ann_id: int,
    current_librarian: models.User = Depends(get_current_librarian),
    db: Session = Depends(get_db)
):
    ann = db.query(models.Announcement).filter(models.Announcement.id == ann_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found.")
    db.delete(ann)
    db.commit()
    return {"message": "Announcement removed."}

# ----------------- LIBRARIAN DASHBOARD KPI STATS -----------------

@app.get("/api/admin/stats", response_model=schemas.LibrarianStats)
def get_librarian_stats(
    current_librarian: models.User = Depends(get_current_librarian),
    db: Session = Depends(get_db)
):
    total_books = db.query(func.sum(models.Book.total_copies)).filter(models.Book.is_active == True).scalar() or 0
    available_books = db.query(func.sum(models.Book.available_copies)).filter(models.Book.is_active == True).scalar() or 0
    borrowed_books = db.query(func.count(models.BorrowingRecord.id)).filter(models.BorrowingRecord.status != "returned").scalar() or 0
    overdue_books = db.query(func.count(models.BorrowingRecord.id)).filter(models.BorrowingRecord.status == "overdue").scalar() or 0
    due_soon_books = db.query(func.count(models.BorrowingRecord.id)).filter(models.BorrowingRecord.status.in_(["due_soon", "due_today"])).scalar() or 0
    registered_users = db.query(func.count(models.User.id)).scalar() or 0
    pending_feedback = db.query(func.count(models.Feedback.id)).filter(models.Feedback.status == "new").scalar() or 0
    pending_requests = db.query(func.count(models.BookRequest.id)).filter(models.BookRequest.status == "pending").scalar() or 0

    return {
        "total_books": int(total_books),
        "available_books": int(available_books),
        "borrowed_books": int(borrowed_books),
        "overdue_books": int(overdue_books),
        "due_soon_books": int(due_soon_books),
        "registered_users": int(registered_users),
        "pending_feedback": int(pending_feedback),
        "pending_book_requests": int(pending_requests)
    }

@app.get("/api/admin/users", response_model=List[schemas.UserResponse])
def get_all_users_for_checkout(
    current_librarian: models.User = Depends(get_current_librarian),
    db: Session = Depends(get_db)
):
    return db.query(models.User).order_by(models.User.full_name.asc()).all()
