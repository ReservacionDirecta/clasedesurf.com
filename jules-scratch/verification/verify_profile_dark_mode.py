from playwright.sync_api import sync_playwright, expect
import time

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(color_scheme="dark")
        page = context.new_page()

        # Generate unique user credentials
        timestamp = int(time.time())
        email = f"testuser{timestamp}@example.com"
        password = "password123"
        name = "Test User"

        # --- Registration ---
        page.goto("http://localhost:3000/register")
        page.get_by_label("Name").fill(name)
        page.get_by_label("Email").fill(email)
        page.get_by_label("Password").fill(password)
        page.get_by_role("button", name="Register").click()

        # Wait for registration to complete and redirect to login
        expect(page).to_have_url("http://localhost:3000/login", timeout=10000)

        # --- Login ---
        page.get_by_label("Email").fill(email)
        page.get_by_label("Password").fill(password)
        page.get_by_role("button", name="Login").click()

        # Wait for login to complete and redirect to the student profile
        expect(page).to_have_url("http://localhost:3000/dashboard/student/profile", timeout=10000)

        # --- Profile Verification ---
        # Wait for the main heading to be visible, indicating the profile has loaded
        profile_heading = page.get_by_role("heading", name="Your Profile")
        expect(profile_heading).to_be_visible(timeout=15000)

        # Take a screenshot
        page.screenshot(path="jules-scratch/verification/verification.png")

        browser.close()

if __name__ == "__main__":
    run_verification()