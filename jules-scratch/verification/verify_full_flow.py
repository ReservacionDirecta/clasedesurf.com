from playwright.sync_api import sync_playwright, expect
import time

# --- Helper Functions ---
def login_as(page, email, password, expected_url):
    """Logs in a user and asserts the landing page."""
    print(f"Logging in as {email}...")
    page.goto("http://localhost:3000/login", timeout=60000)
    page.get_by_label("Email").fill(email)
    page.get_by_label("Password").fill(password)
    page.get_by_role("button", name="Login").click()
    expect(page).to_have_url(expected_url, timeout=15000)
    print("Login successful.")

def logout(page):
    """Logs out the current user."""
    print("Logging out...")
    # The sign out button might be in a dropdown or directly visible
    # This is a robust way to handle it, assuming it's a button.
    # We click the header button first to ensure the menu is open if it's mobile.
    if page.locator('button[aria-label="Abrir menú"]').is_visible():
        page.locator('button[aria-label="Abrir menú"]').click()

    sign_out_button = page.get_by_role("button", name="Cerrar sesión")
    expect(sign_out_button).to_be_visible()
    sign_out_button.click()
    expect(page).to_have_url("http://localhost:3000/", timeout=15000)
    print("Logout successful.")

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, slow_mo=50)
        context = browser.new_context(color_scheme="dark")
        page = context.new_page()

        # --- 1. Admin Flow ---
        print("\n--- Verifying Admin Flow ---")
        login_as(page, "admin@surfschool.com", "password123", "http://localhost:3000/dashboard/admin")
        page.screenshot(path="jules-scratch/verification/admin_dashboard.png")
        # Test payout generation
        page.get_by_role("button", name="Payouts").click()
        page.get_by_label("Start Date").fill("2024-01-01")
        page.get_by_label("End Date").fill("2024-12-31")
        page.get_by_role("button", name="Generate Payouts").click()
        expect(page.get_by_text("Payouts generated successfully.")).to_be_visible()
        page.screenshot(path="jules-scratch/verification/admin_payouts_generated.png")
        logout(page)

        # --- 2. School Admin Flow ---
        print("\n--- Verifying School Admin Flow ---")
        login_as(page, "schooladmin@surfschool.com", "password123", "http://localhost:3000/dashboard/school/profile/1")
        expect(page.get_by_role("heading", name="Financials")).to_be_visible()
        expect(page.get_by_role("button", name="Add New Class")).to_be_visible()
        page.screenshot(path="jules-scratch/verification/school_admin_dashboard.png")
        logout(page)

        # --- 3. Instructor Flow ---
        print("\n--- Verifying Instructor Flow ---")
        login_as(page, "instructor1@surfschool.com", "password123", "http://localhost:3000/dashboard/instructor/profile")
        expect(page.get_by_role("heading", name="My Classes Dashboard")).to_be_visible()
        expect(page.get_by_text("Enrolled Students:")).to_be_visible()
        page.screenshot(path="jules-scratch/verification/instructor_dashboard.png")
        logout(page)

        # --- 4. Student Flow ---
        print("\n--- Verifying Student Flow ---")
        login_as(page, "student1@surfschool.com", "password123", "http://localhost:3000/dashboard/student/profile")
        page.goto("http://localhost:3000/")
        # Find the first available class and book it
        first_book_button = page.get_by_role("button", name="Reservar Ahora").first
        expect(first_book_button).to_be_visible()
        first_book_button.click()
        # Modal interaction
        expect(page.get_by_role("heading", name="Reservar Clase")).to_be_visible()
        page.get_by_label("Nombre completo *").fill("Test Student")
        page.get_by_label("Email *").fill("student1@example.com")
        page.get_by_label("Edad *").fill("30")
        page.get_by_label("Altura (cm) *").fill("175")
        page.get_by_label("Peso (kg) *").fill("70")
        page.get_by_label("Contacto de emergencia *").fill("Emergency C.")
        page.get_by_label("Teléfono de emergencia *").fill("123456789")
        page.get_by_role("button", name="Confirmar Reserva").click()
        # Handle alert
        page.on("dialog", lambda dialog: dialog.accept())
        print("Booking submitted.")
        # Verify reservation
        page.goto("http://localhost:3000/reservations")
        expect(page.get_by_role("heading", name="Mis Reservas")).to_be_visible()
        page.screenshot(path="jules-scratch/verification/student_reservations.png")
        logout(page)

        browser.close()
        print("\n✅ Verification script finished successfully.")

if __name__ == "__main__":
    run_verification()