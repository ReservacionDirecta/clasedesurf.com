from playwright.sync_api import sync_playwright, expect
import time

def login_as(page, email, password):
    """Helper function to log in."""
    page.goto("http://localhost:3000/login")
    page.get_by_label("Email").fill(email)
    page.get_by_label("Password").fill(password)
    page.get_by_role("button", name="Login").click()
    # Wait for navigation to the default profile page after login
    expect(page).to_have_url("http://localhost:3000/dashboard/student/profile", timeout=15000)

def logout(page):
    """Helper function to log out."""
    # This might need adjustment if the signout flow changes
    if page.get_by_role("button", name="Cerrar sesión").is_visible():
        page.get_by_role("button", name="Cerrar sesión").click()
        # Wait for redirection to home page
        expect(page).to_have_url("http://localhost:3000/", timeout=10000)

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(color_scheme="dark")
        page = context.new_page()

        # --- 1. Verify Admin Navigation ---
        print("Verifying Admin role...")
        login_as(page, "admin@surfschool.com", "password123")
        # Check for the specific admin link
        admin_link = page.get_by_role("link", name="Admin Dashboard")
        expect(admin_link).to_be_visible()
        page.screenshot(path="jules-scratch/verification/header_admin.png")
        print("Admin verification successful.")
        logout(page)

        # --- 2. Verify Instructor Navigation ---
        print("Verifying Instructor role...")
        login_as(page, "instructor1@surfschool.com", "password123")
        # Check for the specific instructor links
        instructor_profile_link = page.get_by_role("link", name="Mi Perfil")
        instructor_classes_link = page.get_by_role("link", name="Mis Clases")
        expect(instructor_profile_link).to_be_visible()
        expect(instructor_classes_link).to_be_visible()
        page.screenshot(path="jules-scratch/verification/header_instructor.png")
        print("Instructor verification successful.")
        logout(page)

        # --- 3. Verify Student Navigation ---
        print("Verifying Student role...")
        login_as(page, "student1@surfschool.com", "password123")
        # Check for the specific student links
        student_profile_link = page.get_by_role("link", name="Mi Perfil")
        student_reservations_link = page.get_by_role("link", name="Mis Reservas")
        expect(student_profile_link).to_be_visible()
        expect(student_reservations_link).to_be_visible()
        page.screenshot(path="jules-scratch/verification/header_student.png")
        print("Student verification successful.")
        logout(page)

        browser.close()
        print("Verification script finished successfully.")

if __name__ == "__main__":
    run_verification()