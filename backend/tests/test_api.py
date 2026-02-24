"""
Regression Test Suite for Senegal Mass Times API
Tests all core functionalities before manual testing
"""

import requests
import json
from typing import Dict, Optional

# Configuration
BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api"

# Test credentials
TEST_PARISHES = [
    {"email": "admin@cathedrale-dakar.sn", "password": "password123", "name": "Cathédrale du Souvenir Africain"},
    {"email": "admin@stjoseph-medina.sn", "password": "password123", "name": "Paroisse Saint-Joseph de Médina"},
]

# Color codes for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

class TestResults:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []

    def add_pass(self, test_name: str):
        self.passed += 1
        print(f"{GREEN}✓{RESET} {test_name}")

    def add_fail(self, test_name: str, reason: str):
        self.failed += 1
        self.errors.append(f"{test_name}: {reason}")
        print(f"{RED}✗{RESET} {test_name}")
        print(f"  {RED}Reason:{RESET} {reason}")

    def print_summary(self):
        total = self.passed + self.failed
        print(f"\n{'='*60}")
        print(f"{BLUE}TEST SUMMARY{RESET}")
        print(f"{'='*60}")
        print(f"Total Tests: {total}")
        print(f"{GREEN}Passed: {self.passed}{RESET}")
        print(f"{RED}Failed: {self.failed}{RESET}")

        if self.failed > 0:
            print(f"\n{RED}FAILED TESTS:{RESET}")
            for error in self.errors:
                print(f"  - {error}")

        print(f"{'='*60}")

        if self.failed == 0:
            print(f"{GREEN}✓ ALL TESTS PASSED! Ready for manual testing.{RESET}")
        else:
            print(f"{RED}✗ Some tests failed. Please review before manual testing.{RESET}")

results = TestResults()

def test_api_health():
    """Test if API is running"""
    try:
        response = requests.get(f"{BASE_URL}/docs")
        if response.status_code == 200:
            results.add_pass("API Health Check")
        else:
            results.add_fail("API Health Check", f"Status code: {response.status_code}")
    except Exception as e:
        results.add_fail("API Health Check", str(e))

def test_public_get_all_parishes():
    """Test getting all parishes (public endpoint)"""
    try:
        response = requests.get(f"{API_URL}/parishes")
        data = response.json()

        if response.status_code != 200:
            results.add_fail("GET All Parishes", f"Status code: {response.status_code}")
            return

        if not isinstance(data, list):
            results.add_fail("GET All Parishes", "Response is not a list")
            return

        if len(data) < 10:
            results.add_fail("GET All Parishes", f"Expected at least 10 parishes, got {len(data)}")
            return

        results.add_pass("GET All Parishes")
    except Exception as e:
        results.add_fail("GET All Parishes", str(e))

def test_public_get_parish_by_id():
    """Test getting a specific parish by ID"""
    try:
        response = requests.get(f"{API_URL}/parishes/1")
        data = response.json()

        if response.status_code != 200:
            results.add_fail("GET Parish by ID", f"Status code: {response.status_code}")
            return

        required_fields = ["id", "name", "city", "mass_times"]
        for field in required_fields:
            if field not in data:
                results.add_fail("GET Parish by ID", f"Missing field: {field}")
                return

        results.add_pass("GET Parish by ID")
    except Exception as e:
        results.add_fail("GET Parish by ID", str(e))

def test_public_search_parishes_by_city():
    """Test searching parishes by city"""
    try:
        response = requests.get(f"{API_URL}/parishes?city=Dakar")
        data = response.json()

        if response.status_code != 200:
            results.add_fail("Search Parishes by City", f"Status code: {response.status_code}")
            return

        if not isinstance(data, list):
            results.add_fail("Search Parishes by City", "Response is not a list")
            return

        # All results should have Dakar in city or region
        for parish in data:
            if "Dakar" not in parish.get("city", "") and "Dakar" not in parish.get("region", ""):
                results.add_fail("Search Parishes by City", f"Parish {parish['name']} doesn't match city filter")
                return

        results.add_pass("Search Parishes by City")
    except Exception as e:
        results.add_fail("Search Parishes by City", str(e))

def test_public_search_parishes_by_name():
    """Test searching parishes by parish name"""
    try:
        # Search for "Cathédrale" - should find the cathedral
        response = requests.get(f"{API_URL}/parishes?city=Cathédrale")
        data = response.json()

        if response.status_code != 200:
            results.add_fail("Search Parishes by Name", f"Status code: {response.status_code}")
            return

        if not isinstance(data, list):
            results.add_fail("Search Parishes by Name", "Response is not a list")
            return

        if len(data) == 0:
            results.add_fail("Search Parishes by Name", "No results for 'Cathédrale'")
            return

        # At least one result should have "Cathédrale" in the name
        found = any("Cathédrale" in parish.get("name", "") for parish in data)
        if not found:
            results.add_fail("Search Parishes by Name", "Results don't contain 'Cathédrale' in name")
            return

        results.add_pass("Search Parishes by Name")
    except Exception as e:
        results.add_fail("Search Parishes by Name", str(e))

def test_login_valid_credentials():
    """Test login with valid credentials"""
    try:
        response = requests.post(
            f"{API_URL}/auth/login",
            json={"email": TEST_PARISHES[0]["email"], "password": TEST_PARISHES[0]["password"]}
        )
        data = response.json()

        if response.status_code != 200:
            results.add_fail("Login with Valid Credentials", f"Status code: {response.status_code}")
            return

        required_fields = ["access_token", "token_type", "parish_id", "parish_name"]
        for field in required_fields:
            if field not in data:
                results.add_fail("Login with Valid Credentials", f"Missing field: {field}")
                return

        if data["parish_name"] != TEST_PARISHES[0]["name"]:
            results.add_fail("Login with Valid Credentials", f"Wrong parish name: {data['parish_name']}")
            return

        results.add_pass("Login with Valid Credentials")
        return data["access_token"]
    except Exception as e:
        results.add_fail("Login with Valid Credentials", str(e))
        return None

def test_login_invalid_credentials():
    """Test login with invalid credentials"""
    try:
        response = requests.post(
            f"{API_URL}/auth/login",
            json={"email": TEST_PARISHES[0]["email"], "password": "wrongpassword"}
        )

        if response.status_code == 401:
            results.add_pass("Login with Invalid Credentials (should fail)")
        else:
            results.add_fail("Login with Invalid Credentials", f"Expected 401, got {response.status_code}")
    except Exception as e:
        results.add_fail("Login with Invalid Credentials", str(e))

def test_admin_get_parish(token: str):
    """Test getting authenticated parish info"""
    if not token:
        results.add_fail("Admin Get Parish Info", "No token available")
        return

    try:
        response = requests.get(
            f"{API_URL}/admin/parish",
            headers={"Authorization": f"Bearer {token}"}
        )
        data = response.json()

        if response.status_code != 200:
            results.add_fail("Admin Get Parish Info", f"Status code: {response.status_code}")
            return

        if data["name"] != TEST_PARISHES[0]["name"]:
            results.add_fail("Admin Get Parish Info", f"Wrong parish: {data['name']}")
            return

        results.add_pass("Admin Get Parish Info")
    except Exception as e:
        results.add_fail("Admin Get Parish Info", str(e))

def test_admin_add_mass_time(token: str) -> Optional[int]:
    """Test adding a mass time"""
    if not token:
        results.add_fail("Admin Add Mass Time", "No token available")
        return None

    try:
        mass_data = {
            "day_of_week": "Monday",
            "time": "06:00:00",
            "language": "French",
            "mass_type": "Test Regression",
            "notes": "Automated test - should be deleted"
        }

        response = requests.post(
            f"{API_URL}/admin/parishes/1/mass-times",
            headers={"Authorization": f"Bearer {token}"},
            json=mass_data
        )
        data = response.json()

        if response.status_code not in [200, 201]:
            results.add_fail("Admin Add Mass Time", f"Status code: {response.status_code}")
            return None

        if "id" not in data:
            results.add_fail("Admin Add Mass Time", "No ID in response")
            return None

        results.add_pass("Admin Add Mass Time")
        return data["id"]
    except Exception as e:
        results.add_fail("Admin Add Mass Time", str(e))
        return None

def test_admin_update_mass_time(token: str, mass_id: int):
    """Test updating a mass time"""
    if not token or not mass_id:
        results.add_fail("Admin Update Mass Time", "No token or mass ID available")
        return

    try:
        update_data = {
            "day_of_week": "Monday",
            "time": "07:00:00",
            "language": "Wolof",
            "mass_type": "Test Updated"
        }

        response = requests.put(
            f"{API_URL}/admin/parishes/1/mass-times/{mass_id}",
            headers={"Authorization": f"Bearer {token}"},
            json=update_data
        )
        data = response.json()

        if response.status_code != 200:
            results.add_fail("Admin Update Mass Time", f"Status code: {response.status_code}")
            return

        if data["time"] != "07:00:00" or data["language"] != "Wolof":
            results.add_fail("Admin Update Mass Time", "Update didn't apply correctly")
            return

        results.add_pass("Admin Update Mass Time")
    except Exception as e:
        results.add_fail("Admin Update Mass Time", str(e))

def test_admin_delete_mass_time(token: str, mass_id: int):
    """Test deleting a mass time"""
    if not token or not mass_id:
        results.add_fail("Admin Delete Mass Time", "No token or mass ID available")
        return

    try:
        response = requests.delete(
            f"{API_URL}/admin/parishes/1/mass-times/{mass_id}",
            headers={"Authorization": f"Bearer {token}"}
        )

        if response.status_code != 200:
            results.add_fail("Admin Delete Mass Time", f"Status code: {response.status_code}")
            return

        # Verify it's actually deleted
        verify_response = requests.get(f"{API_URL}/parishes/1")
        parish_data = verify_response.json()

        for mass in parish_data["mass_times"]:
            if mass["id"] == mass_id:
                results.add_fail("Admin Delete Mass Time", "Mass still exists after deletion")
                return

        results.add_pass("Admin Delete Mass Time")
    except Exception as e:
        results.add_fail("Admin Delete Mass Time", str(e))

def test_admin_update_parish_info(token: str):
    """Test updating parish information"""
    if not token:
        results.add_fail("Admin Update Parish Info", "No token available")
        return

    try:
        # Get current data first
        response = requests.get(
            f"{API_URL}/admin/parish",
            headers={"Authorization": f"Bearer {token}"}
        )
        current_data = response.json()
        original_phone = current_data.get("phone")

        # Update with test data
        update_data = {
            "phone": "+221 33 TEST TEST"
        }

        response = requests.put(
            f"{API_URL}/admin/parishes/{current_data['id']}",
            headers={"Authorization": f"Bearer {token}"},
            json=update_data
        )

        if response.status_code != 200:
            results.add_fail("Admin Update Parish Info", f"Status code: {response.status_code}")
            return

        # Restore original data
        if original_phone:
            requests.put(
                f"{API_URL}/admin/parishes/{current_data['id']}",
                headers={"Authorization": f"Bearer {token}"},
                json={"phone": original_phone}
            )

        results.add_pass("Admin Update Parish Info")
    except Exception as e:
        results.add_fail("Admin Update Parish Info", str(e))

def test_unauthorized_access():
    """Test that protected endpoints reject requests without auth"""
    try:
        response = requests.get(f"{API_URL}/admin/parish")

        if response.status_code == 401:
            results.add_pass("Unauthorized Access Protection")
        else:
            results.add_fail("Unauthorized Access Protection", f"Expected 401, got {response.status_code}")
    except Exception as e:
        results.add_fail("Unauthorized Access Protection", str(e))

def run_all_tests():
    """Run all regression tests"""
    print(f"\n{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}SENEGAL MASS TIMES - REGRESSION TEST SUITE{RESET}")
    print(f"{BLUE}{'='*60}{RESET}\n")

    print(f"{YELLOW}Testing API Health...{RESET}")
    test_api_health()

    print(f"\n{YELLOW}Testing Public Endpoints...{RESET}")
    test_public_get_all_parishes()
    test_public_get_parish_by_id()
    test_public_search_parishes_by_city()
    test_public_search_parishes_by_name()

    print(f"\n{YELLOW}Testing Authentication...{RESET}")
    token = test_login_valid_credentials()
    test_login_invalid_credentials()
    test_unauthorized_access()

    print(f"\n{YELLOW}Testing Admin Endpoints...{RESET}")
    test_admin_get_parish(token)
    test_admin_update_parish_info(token)

    print(f"\n{YELLOW}Testing Mass Times CRUD...{RESET}")
    mass_id = test_admin_add_mass_time(token)
    test_admin_update_mass_time(token, mass_id)
    test_admin_delete_mass_time(token, mass_id)

    print(f"\n{YELLOW}Testing Multiple Parish Logins...{RESET}")
    for i, parish in enumerate(TEST_PARISHES[1:], 2):
        response = requests.post(
            f"{API_URL}/auth/login",
            json={"email": parish["email"], "password": parish["password"]}
        )
        if response.status_code == 200:
            results.add_pass(f"Login Parish {i}: {parish['name']}")
        else:
            results.add_fail(f"Login Parish {i}: {parish['name']}", f"Status: {response.status_code}")

    results.print_summary()

    return results.failed == 0

if __name__ == "__main__":
    import sys
    success = run_all_tests()
    sys.exit(0 if success else 1)
