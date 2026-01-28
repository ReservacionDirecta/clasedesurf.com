import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:3000/classes/3", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # -> Click on the 'Registrarse' button to open the registration modal to send a registration request with valid user data.
        frame = context.pages[-1]
        # Click on 'Registrarse' button to open registration modal for new user registration.
        elem = frame.locator('xpath=html/body/header/div/div/div/a[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Dismiss or accept the cookie consent banner to enable interaction with the 'Crear Cuenta' button, then submit the registration form.
        frame = context.pages[-1]
        # Click 'Aceptar todas' button to accept cookies and dismiss the cookie consent banner.
        elem = frame.locator('xpath=html/body/div[3]/div/div/div[2]/button[3]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'Crear Cuenta' button to submit the registration form and trigger user registration.
        frame = context.pages[-1]
        # Click on 'Crear Cuenta' button to submit the registration form and register new user.
        elem = frame.locator('xpath=html/body/div[2]/div/div[2]/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Verify that the new user is created in the database and that valid JWT and refresh tokens are issued and returned.
        await page.goto('http://localhost:3000/api/auth/tokens', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Return to the main page or user profile page to check if user is logged in and tokens are stored in cookies or local storage, or check for any UI indication of successful login and token issuance.
        await page.goto('http://localhost:3000/', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Perform an authenticated action to confirm token validity and user session, such as navigating to the user dashboard or profile page.
        frame = context.pages[-1]
        # Click on 'Dashboard' link to navigate to user dashboard and verify authenticated access.
        elem = frame.locator('xpath=html/body/header/div/div/nav/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=¡Hola, TestUser123! 🏄‍♂️').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Dashboard').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Activo').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Principiante').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=No tienes clases próximas').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=¡Es hora de reservar tu siguiente aventura!').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    