from playwright.sync_api import sync_playwright, expect
import time

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(color_scheme="dark")
        page = context.new_page()

        # --- Admin Login and School Profile Verification ---
        admin_email = f"admin{int(time.time())}@example.com"
        admin_password = "password123"
        admin_name = "Admin User"

        # Register as Admin
        page.goto("http://localhost:3000/register")
        page.get_by_label("Name").fill(admin_name)
        page.get_by_label("Email").fill(admin_email)
        page.get_by_label("Password").fill(admin_password)
        page.get_by_role("button", name="Register").click()
        expect(page).to_have_url("http://localhost:3000/login", timeout=10000)

        # Login as Admin
        page.get_by_label("Email").fill(admin_email)
        page.get_by_label("Password").fill(admin_password)
        page.get_by_role("button", name="Login").click()
        expect(page).to_have_url("http://localhost:3000/dashboard/student/profile", timeout=10000)

        # Navigate to a school profile page (assuming school with id 1 exists)
        page.goto("http://localhost:3000/dashboard/school/profile/1")
        page.wait_for_load_state("networkidle")
        page.screenshot(path="jules-scratch/verification/school_profile.png")

        # --- Instructor Login and Profile Verification ---
        page.goto("http://localhost:3000/api/auth/signout") # sign out admin
        page.get_by_role("button", name="Sign out").click()

        instructor_email = f"instructor{int(time.time())}@example.com"
        instructor_password = "password123"
        instructor_name = "Instructor User"

        # Register as Instructor
        page.goto("http://localhost:3000/register")
        page.get_by_label("Name").fill(instructor_name)
        page.get_by_label("Email").fill(instructor_email)
        page.get_by_label("Password").fill(instructor_password)
        page.get_by_role("button", name="Register").click()
        expect(page).to_have_url("http://localhost:3000/login", timeout=10000)

        # Login as Instructor
        page.get_by_label("Email").fill(instructor_email)
        page.get_by_label("Password").fill(instructor_password)
        page.get_by_role("button", name="Login").click()
        expect(page).to_have_url("http://localhost:3000/dashboard/student/profile", timeout=10000)

        # Navigate to instructor profile page
        page.goto("http://localhost:3000/dashboard/instructor/profile")
        page.wait_for_load_state("networkidle")
        page.screenshot(path="jules-scratch/verification/instructor_profile.png")

        browser.close()

if __name__ == "__main__":
    run_verification()