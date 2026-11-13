"""
Unit and Integration Test Suite for LibraryEase Admin Portal Endpoints
"""

import unittest
from fastapi.testclient import TestClient
from main import app
from database import engine, get_db, SessionLocal
import models
from security import hash_password

class TestAdminPortal(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        db = SessionLocal()
        try:
            # Ensure admin exists
            admin = db.query(models.User).filter(models.User.email == "admin@libraryease.org").first()
            if not admin:
                admin = models.User(
                    email="admin@libraryease.org",
                    full_name="LibraryEase Administrator",
                    hashed_password=hash_password("admin123"),
                    role="admin",
                    phone="+91 98200 99999",
                    member_card_no="ADM-0001",
                    is_active=True
                )
                db.add(admin)
                db.commit()
                db.refresh(admin)
            cls.admin_id = admin.id
        finally:
            db.close()

    def test_01_admin_login_success(self):
        res = self.client.post("/api/auth/admin-login", json={
            "email": "admin@libraryease.org",
            "password": "admin123"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["user"]["role"], "admin")

    def test_02_admin_login_rejects_patron(self):
        res = self.client.post("/api/auth/admin-login", json={
            "email": "patron@libraryease.org",
            "password": "patron123"
        })
        self.assertEqual(res.status_code, 403)
        self.assertIn("Administrator privileges required", res.json()["detail"])

    def test_03_admin_login_invalid_password(self):
        res = self.client.post("/api/auth/admin-login", json={
            "email": "admin@libraryease.org",
            "password": "wrongpassword"
        })
        self.assertEqual(res.status_code, 401)

    def test_04_admin_dashboard_stats(self):
        login_res = self.client.post("/api/auth/admin-login", json={
            "email": "admin@libraryease.org",
            "password": "admin123"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        res = self.client.get("/api/admin/dashboard-stats", headers=headers)
        self.assertEqual(res.status_code, 200)
        stats = res.json()
        self.assertIn("total_libraries", stats)
        self.assertIn("total_books", stats)
        self.assertIn("registered_users", stats)
        self.assertIn("active_borrowings", stats)
        self.assertIn("recent_books", stats)
        self.assertIn("recent_libraries", stats)
        self.assertIn("recent_activities", stats)
        self.assertIn("category_distribution", stats)
        self.assertGreaterEqual(stats["total_libraries"], 12)
        self.assertGreaterEqual(stats["total_books"], 15)

    def test_05_library_crud_lifecycle_and_public_sync(self):
        login_res = self.client.post("/api/auth/admin-login", json={
            "email": "admin@libraryease.org",
            "password": "admin123"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Create a new test library
        new_lib_payload = {
            "name": "Bandra Heritage Civic Reading Room",
            "area": "Bandra West",
            "locality": "Bandra",
            "region": "Western Suburbs",
            "city": "Mumbai",
            "state": "Maharashtra",
            "pincode": "400050",
            "address": "Opposite St. Andrew Church, Hill Road, Bandra West",
            "phone": "+91 (022) 2640-1234",
            "email": "bandra.civic@libraryease.org",
            "description": "Charming colonial study hall overlooking Bandra heritage precincts.",
            "hours": {
                "weekdays": "08:30 AM – 08:30 PM",
                "saturday": "09:00 AM – 06:00 PM",
                "sunday": "Closed"
            },
            "services": ["General Book Lending", "Quiet Study Zone", "Civic Wi-Fi"]
        }
        res_create = self.client.post("/api/libraries", json=new_lib_payload, headers=headers)
        self.assertEqual(res_create.status_code, 201)
        created_lib = res_create.json()
        lib_id = created_lib["id"]
        self.assertEqual(created_lib["name"], "Bandra Heritage Civic Reading Room")

        # 2. Verify it appears on public GET /api/libraries from database
        res_public = self.client.get("/api/libraries?locality=Bandra")
        self.assertEqual(res_public.status_code, 200)
        public_data = res_public.json()
        self.assertTrue(any(lib["id"] == lib_id for lib in public_data["libraries"]))

        # 3. Update the library
        res_update = self.client.put(f"/api/libraries/{lib_id}", json={
            "phone": "+91 (022) 2640-9999",
            "description": "Updated description with extended heritage collections."
        }, headers=headers)
        self.assertEqual(res_update.status_code, 200)
        self.assertEqual(res_update.json()["phone"], "+91 (022) 2640-9999")

        # 4. Toggle active status
        res_toggle = self.client.patch(f"/api/libraries/{lib_id}/status", json={"is_active": False}, headers=headers)
        self.assertEqual(res_toggle.status_code, 200)
        self.assertFalse(res_toggle.json()["is_active"])

        # 5. Clean up delete
        res_delete = self.client.delete(f"/api/libraries/{lib_id}", headers=headers)
        self.assertEqual(res_delete.status_code, 200)
        self.assertTrue(res_delete.json()["success"])

    def test_06_user_management_and_safety_rules(self):
        login_res = self.client.post("/api/auth/admin-login", json={
            "email": "admin@libraryease.org",
            "password": "admin123"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. List users
        res_users = self.client.get("/api/admin/users", headers=headers)
        self.assertEqual(res_users.status_code, 200)
        users = res_users.json()
        self.assertGreater(len(users), 0)
        admin_user = next((u for u in users if u["id"] == self.admin_id), None)
        self.assertIsNotNone(admin_user)

        # 2. View user details
        res_details = self.client.get(f"/api/admin/users/{self.admin_id}/details", headers=headers)
        self.assertEqual(res_details.status_code, 200)
        self.assertIn("borrowing_history", res_details.json())

        # 3. Safety Rule 1: Cannot deactivate own account
        res_self_deact = self.client.patch(f"/api/admin/users/{self.admin_id}/status", json={"is_active": False}, headers=headers)
        self.assertEqual(res_self_deact.status_code, 400)
        self.assertIn("cannot deactivate your own", res_self_deact.json()["detail"].lower())

    def test_07_books_include_inactive(self):
        login_res = self.client.post("/api/auth/admin-login", json={
            "email": "admin@libraryease.org",
            "password": "admin123"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        res = self.client.get("/api/books?include_inactive=true", headers=headers)
        self.assertEqual(res.status_code, 200)
        books = res.json()
        self.assertIsInstance(books, list)
        self.assertGreater(len(books), 0)

if __name__ == "__main__":
    unittest.main()
