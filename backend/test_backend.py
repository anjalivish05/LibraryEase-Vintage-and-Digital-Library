"""
Comprehensive Unit & Integration Test Suite for LibraryEase FastAPI Backend
"""

import sys
import unittest
from fastapi.testclient import TestClient

from main import app
from database import Base, engine, SessionLocal
from seed_data import seed_database
from scheduler import evaluate_and_dispatch_reminders

class TestLibraryEaseBackend(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Ensure database tables exist and are seeded
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            seed_database(db)
            evaluate_and_dispatch_reminders(db)
        finally:
            db.close()
        
        cls.client = TestClient(app)

    def test_01_health_check(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["service"], "LibraryEase Backend")

    def test_02_library_info(self):
        response = self.client.get("/api/info")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("library_name", data)
        self.assertIn("hours", data)
        self.assertTrue(len(data["hours"]) > 0)

    def test_03_patron_login_success(self):
        payload = {
            "email": "patron@libraryease.org",
            "password": "patron123"
        }
        response = self.client.post("/api/auth/login", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["token_type"], "bearer")
        self.assertEqual(data["user"]["email"], "patron@libraryease.org")

    def test_04_patron_login_invalid_password(self):
        payload = {
            "email": "patron@libraryease.org",
            "password": "wrongpassword"
        }
        response = self.client.post("/api/auth/login", json=payload)
        self.assertEqual(response.status_code, 401)

    def test_05_books_catalog(self):
        response = self.client.get("/api/books?limit=10")
        self.assertEqual(response.status_code, 200)
        books = response.json()
        self.assertTrue(isinstance(books, list))
        self.assertGreater(len(books), 0)
        self.assertIn("title", books[0])
        self.assertIn("author", books[0])

    def test_06_books_categories(self):
        response = self.client.get("/api/books/categories")
        self.assertEqual(response.status_code, 200)
        cats = response.json()
        self.assertTrue(isinstance(cats, list))
        self.assertGreater(len(cats), 0)

    def test_07_ai_search_catalog(self):
        query = {
            "query": "python programming for beginners",
            "category": None,
            "language": None,
            "only_available": False
        }
        response = self.client.post("/api/books/ai-search", json=query)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("results", data)
        self.assertIn("understood_intent", data)
        self.assertTrue(len(data["results"]) > 0)

    def test_08_authenticated_borrowings_and_notifications(self):
        # 1. Login
        login_res = self.client.post("/api/auth/login", json={
            "email": "patron@libraryease.org",
            "password": "patron123"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Get user profile
        me_res = self.client.get("/api/auth/me", headers=headers)
        self.assertEqual(me_res.status_code, 200)
        self.assertEqual(me_res.json()["email"], "patron@libraryease.org")

        # 3. Get borrowings
        loans_res = self.client.get("/api/borrowings/my", headers=headers)
        self.assertEqual(loans_res.status_code, 200)
        loans = loans_res.json()
        self.assertTrue(isinstance(loans, list))

        # 4. Get notifications
        notifs_res = self.client.get("/api/notifications", headers=headers)
        self.assertEqual(notifs_res.status_code, 200)
        notifs_data = notifs_res.json()
        self.assertIn("notifications", notifs_data)
        self.assertIn("unread_count", notifs_data)

    def test_09_feedback_submission(self):
        feedback_payload = {
            "user_name": "Clara Oswald",
            "user_email": "clara@example.org",
            "rating": 5,
            "category": "Website Experience",
            "comments": "The vintage library interface and catalog search are exceptionally well designed!"
        }
        response = self.client.post("/api/feedback", json=feedback_payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["user_name"], "Clara Oswald")
        self.assertEqual(data["rating"], 5)

    def test_10_reminder_audit_scan(self):
        response = self.client.post("/api/reminders/scan")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])

    def test_11_book_crud_lifecycle(self):
        # 1. GET specific book
        res_get = self.client.get("/api/books/1")
        self.assertEqual(res_get.status_code, 200)
        book1 = res_get.json()
        self.assertEqual(book1["id"], 1)
        self.assertIn("title", book1)

        # 2. Login as librarian to manage catalog
        login_res = self.client.post("/api/auth/login", json={
            "email": "librarian@libraryease.org",
            "password": "admin123"
        })
        self.assertEqual(login_res.status_code, 200)
        lib_headers = {"Authorization": f"Bearer {login_res.json()['access_token']}"}

        # 3. Verify unauthenticated creation fails
        new_book_payload = {
            "title": "A Fine Balance",
            "author": "Rohinton Mistry",
            "category": "Historical Fiction",
            "language": "English",
            "description": "Set in Mumbai during the turbulent period of the Emergency, capturing life in the metropolis.",
            "publisher": "McClelland & Stewart",
            "publication_year": 1995,
            "total_copies": 3,
            "available_copies": 3,
            "shelf_location": "Indian Fiction I-05",
            "tags": "mumbai, classic, historical fiction, literature"
        }
        unauth_res = self.client.post("/api/books", json=new_book_payload)
        self.assertIn(unauth_res.status_code, [401, 403])

        # 4. POST create new book with librarian privileges
        res_post = self.client.post("/api/books", json=new_book_payload, headers=lib_headers)
        self.assertEqual(res_post.status_code, 200)
        created_book = res_post.json()
        created_id = created_book["id"]
        self.assertEqual(created_book["title"], "A Fine Balance")

        # 5. PUT update the created book
        update_payload = {
            "available_copies": 2,
            "shelf_location": "Indian Literature Stacks IL-10"
        }
        res_put = self.client.put(f"/api/books/{created_id}", json=update_payload, headers=lib_headers)
        self.assertEqual(res_put.status_code, 200)
        updated_book = res_put.json()
        self.assertEqual(updated_book["available_copies"], 2)
        self.assertEqual(updated_book["shelf_location"], "Indian Literature Stacks IL-10")

        # 6. DELETE deactivate the book
        res_del = self.client.delete(f"/api/books/{created_id}", headers=lib_headers)
        self.assertEqual(res_del.status_code, 200)
        del_data = res_del.json()
        self.assertTrue(del_data.get("success", False) or "deactivated" in del_data.get("message", ""))

    def test_12_libraries_endpoints(self):
        # 1. GET all libraries
        res_all = self.client.get("/api/libraries")
        self.assertEqual(res_all.status_code, 200)
        data_all = res_all.json()
        self.assertEqual(data_all["city"], "Mumbai")
        self.assertGreaterEqual(data_all["total"], 12)

        # 2. GET single library by ID
        res_single = self.client.get("/api/libraries/mumbai-lib-1")
        self.assertEqual(res_single.status_code, 200)
        lib1 = res_single.json()
        self.assertEqual(lib1["id"], "mumbai-lib-1")
        self.assertIn("David Sassoon", lib1["name"])

        # 3. GET with locality query filter
        res_locality = self.client.get("/api/libraries?locality=Fort")
        self.assertEqual(res_locality.status_code, 200)
        data_loc = res_locality.json()
        self.assertGreater(data_loc["total"], 0)
        self.assertTrue(any("Fort" in l["area"] or "Fort" in l["locality"] for l in data_loc["libraries"]))

        # 4. GET 404 for non-existent library
        res_404 = self.client.get("/api/libraries/nonexistent-branch-xyz")
        self.assertEqual(res_404.status_code, 404)

    def test_13_ai_status(self):
        res = self.client.get("/api/ai/status")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("mode", data)
        self.assertIn("ai_enabled", data)
        self.assertIn("service", data)
        self.assertIn(data["mode"], ["demo_rule_based", "gemini_ai"])

    def test_14_ai_chat_flow(self):
        # 1. Test conversational recommendation query
        chat_req = {
            "message": "Can you recommend a compelling science fiction novel about space?",
            "conversation_history": [],
            "preferred_category": "Science",
            "mood": "Futuristic"
        }
        res = self.client.post("/api/ai/chat", json=chat_req)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("reply", data)
        self.assertIn("mode", data)
        self.assertIn("recommendations", data)
        self.assertTrue(len(data["reply"]) > 0)
        self.assertIsInstance(data["recommendations"], list)

        # 2. Test conversational greeting
        greeting_req = {
            "message": "Hello, how can you help me today?",
            "conversation_history": []
        }
        res_greet = self.client.post("/api/ai/chat", json=greeting_req)
        self.assertEqual(res_greet.status_code, 200)
        greet_data = res_greet.json()
        self.assertIn("reply", greet_data)

    def test_15_legacy_ai_assistant_alias(self):
        req = {
            "message": "Suggest historical philosophy",
            "conversation_history": []
        }
        res = self.client.post("/api/ai-assistant", json=req)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("reply", data)

    def test_16_patron_borrow_and_return_persistence(self):
        # 1. Login as patron
        login_res = self.client.post("/api/auth/login", json={
            "email": "patron@libraryease.org",
            "password": "patron123"
        })
        self.assertEqual(login_res.status_code, 200)
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Get initial available copies of book 2
        book_res = self.client.get("/api/books/2")
        self.assertEqual(book_res.status_code, 200)
        initial_copies = book_res.json()["available_copies"]

        # 3. Patron issues book 2
        issue_res = self.client.post("/api/borrowings/issue", json={
            "book_id": 2,
            "due_days": 21
        }, headers=headers)
        
        # If already borrowed in a previous run, return it first then re-issue
        if issue_res.status_code == 400 and "already have an active loan" in issue_res.text:
            my_loans = self.client.get("/api/borrowings/my", headers=headers).json()
            for l in my_loans:
                if l["book_id"] == 2 and l["status"] in ["borrowed", "overdue"]:
                    self.client.post(f"/api/borrowings/{l['id']}/return", headers=headers)
            # Re-fetch initial copies after cleanup
            initial_copies = self.client.get("/api/books/2").json()["available_copies"]
            issue_res = self.client.post("/api/borrowings/issue", json={
                "book_id": 2,
                "due_days": 21
            }, headers=headers)

        self.assertEqual(issue_res.status_code, 200)
        issued_record = issue_res.json()
        self.assertEqual(issued_record["book_id"], 2)
        self.assertEqual(issued_record["status"], "borrowed")
        record_id = issued_record["id"]

        # 4. Verify book available_copies decremented
        after_issue = self.client.get("/api/books/2").json()["available_copies"]
        self.assertEqual(after_issue, initial_copies - 1)

        # 5. Verify loan is in patron's /borrowings/my
        my_loans_res = self.client.get("/api/borrowings/my", headers=headers)
        self.assertEqual(my_loans_res.status_code, 200)
        my_loans = my_loans_res.json()
        matching = [l for l in my_loans if l["id"] == record_id]
        self.assertEqual(len(matching), 1)
        self.assertEqual(matching[0]["status"], "borrowed")
        self.assertEqual(matching[0]["renew_count"], 0)
        self.assertEqual(matching[0]["renewals_remaining"], 2)
        self.assertTrue(matching[0]["is_renewable"])

        # 6. Test Book Renewal Workflow (Renewal 1: +14 days)
        renew_res1 = self.client.post(f"/api/borrowings/{record_id}/renew", headers=headers)
        self.assertEqual(renew_res1.status_code, 200)
        renewed1 = renew_res1.json()
        self.assertEqual(renewed1["renew_count"], 1)
        self.assertEqual(renewed1["renewals_remaining"], 1)
        self.assertTrue(renewed1["is_renewable"])

        # 7. Test Second Renewal (Renewal 2: +14 days)
        renew_res2 = self.client.post(f"/api/borrowings/{record_id}/renew", headers=headers)
        self.assertEqual(renew_res2.status_code, 200)
        renewed2 = renew_res2.json()
        self.assertEqual(renewed2["renew_count"], 2)
        self.assertEqual(renewed2["renewals_remaining"], 0)
        self.assertFalse(renewed2["is_renewable"])

        # 8. Test Third Renewal Rejection (Max renewals exceeded)
        renew_res3 = self.client.post(f"/api/borrowings/{record_id}/renew", headers=headers)
        self.assertEqual(renew_res3.status_code, 400)
        self.assertIn("Maximum renewals reached", renew_res3.text)

        # 9. Patron returns the book
        return_res = self.client.post(f"/api/borrowings/{record_id}/return", headers=headers)
        self.assertEqual(return_res.status_code, 200)
        returned_record = return_res.json()
        self.assertEqual(returned_record["status"], "returned")
        self.assertIsNotNone(returned_record["return_date"])

        # 10. Attempting renewal on returned book fails
        renew_returned = self.client.post(f"/api/borrowings/{record_id}/renew", headers=headers)
        self.assertEqual(renew_returned.status_code, 400)

        # 11. Verify inventory copy count restored
        after_return = self.client.get("/api/books/2").json()["available_copies"]
        self.assertEqual(after_return, initial_copies)

    def test_17_cors_and_database_persistence(self):
        # 1. Test CORS response headers for localhost origin
        cors_headers = {
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "authorization,content-type"
        }
        res_options = self.client.options("/api/borrowings/issue", headers=cors_headers)
        self.assertEqual(res_options.status_code, 200)
        self.assertEqual(res_options.headers.get("access-control-allow-origin"), "http://localhost:5173")
        self.assertEqual(res_options.headers.get("access-control-allow-credentials"), "true")

        # 2. Test SQL libraries table
        from database import SessionLocal
        import models
        db = SessionLocal()
        try:
            lib_count = db.query(models.Library).count()
            self.assertEqual(lib_count, 12)
            first_lib = db.query(models.Library).filter(models.Library.id == "mumbai-lib-1").first()
            self.assertIsNotNone(first_lib)
            self.assertIn("David Sassoon", first_lib.name)
        finally:
            db.close()

    def test_18_librarian_dashboard_access_control_and_endpoints(self):
        # 1. Regular patron credentials
        login_patron = self.client.post("/api/auth/login", json={
            "email": "patron@libraryease.org",
            "password": "patron123"
        })
        patron_headers = {"Authorization": f"Bearer {login_patron.json()['access_token']}"}

        # 2. Librarian credentials
        login_lib = self.client.post("/api/auth/login", json={
            "email": "librarian@libraryease.org",
            "password": "admin123"
        })
        lib_headers = {"Authorization": f"Bearer {login_lib.json()['access_token']}"}

        # 3. Patron CANNOT access librarian stats (403 Forbidden)
        res_patron_stats = self.client.get("/api/librarian/stats", headers=patron_headers)
        self.assertEqual(res_patron_stats.status_code, 403)

        # 4. Patron CANNOT access member management (403 Forbidden)
        res_patron_members = self.client.get("/api/librarian/members", headers=patron_headers)
        self.assertEqual(res_patron_members.status_code, 403)

        # 5. Librarian CAN access stats
        res_lib_stats = self.client.get("/api/librarian/stats", headers=lib_headers)
        self.assertEqual(res_lib_stats.status_code, 200)
        stats = res_lib_stats.json()
        self.assertIn("total_books", stats)
        self.assertIn("registered_members", stats)
        self.assertIn("active_borrowings", stats)
        self.assertIn("overdue_borrowings", stats)
        self.assertIn("pending_requests", stats)

        # 6. Librarian CAN access members list
        res_lib_members = self.client.get("/api/librarian/members", headers=lib_headers)
        self.assertEqual(res_lib_members.status_code, 200)
        members = res_lib_members.json()
        self.assertIsInstance(members, list)
        self.assertGreater(len(members), 0)

        # 7. Librarian CAN view member borrowing history
        first_user_id = members[0]["id"]
        res_user_history = self.client.get(f"/api/librarian/members/{first_user_id}/borrowings", headers=lib_headers)
        self.assertEqual(res_user_history.status_code, 200)
        self.assertIsInstance(res_user_history.json(), list)

    def test_19_book_requests_lifecycle(self):
        # 1. Login as patron
        login_res = self.client.post("/api/auth/login", json={
            "email": "patron@libraryease.org",
            "password": "patron123"
        })
        patron_headers = {"Authorization": f"Bearer {login_res.json()['access_token']}"}

        # 2. Login as librarian
        login_lib = self.client.post("/api/auth/login", json={
            "email": "librarian@libraryease.org",
            "password": "admin123"
        })
        lib_headers = {"Authorization": f"Bearer {login_lib.json()['access_token']}"}

        # 3. Patron submits book request
        req_payload = {
            "user_name": "Alex Morgan",
            "user_email": "patron@libraryease.org",
            "book_title": "The Glass Palace",
            "author": "Amitav Ghosh",
            "category": "Historical Fiction",
            "reason": "Crucial reading for Indian Ocean colonial history research study."
        }
        sub_res = self.client.post("/api/book-requests", json=req_payload, headers=patron_headers)
        self.assertEqual(sub_res.status_code, 200)
        req_data = sub_res.json()
        req_id = req_data["id"]
        self.assertEqual(req_data["book_title"], "The Glass Palace")
        self.assertEqual(req_data["status"], "pending")

        # 4. Patron views their own requests
        my_reqs_res = self.client.get("/api/book-requests/my", headers=patron_headers)
        self.assertEqual(my_reqs_res.status_code, 200)
        my_reqs = my_reqs_res.json()
        self.assertTrue(any(r["id"] == req_id for r in my_reqs))

        # 5. Librarian views all requests
        all_reqs_res = self.client.get("/api/book-requests/all", headers=lib_headers)
        self.assertEqual(all_reqs_res.status_code, 200)

        # 6. Librarian approves the request
        update_res = self.client.put(f"/api/book-requests/{req_id}/status", json={
            "status": "approved",
            "librarian_response": "Volume acquired and cataloged into South Asian fiction collection."
        }, headers=lib_headers)
        self.assertEqual(update_res.status_code, 200)
        updated_data = update_res.json()
        self.assertEqual(updated_data["status"], "approved")
        self.assertIn("acquired", updated_data["librarian_response"])

if __name__ == "__main__":
    unittest.main()
