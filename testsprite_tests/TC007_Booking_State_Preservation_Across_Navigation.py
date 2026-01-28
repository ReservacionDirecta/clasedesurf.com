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
        # -> Click the 'Reservar ahora' button to open the booking modal and begin entering participant details.
        frame = context.pages[-1].frame_locator('html > body > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(3) > div > section:nth-of-type(4) > div > div > iframe.w-full.h-full.grayscale-10.transition-all.duration-700[src="https://maps.google.com/maps?q=Playa%20Playa%20M%C3%A1ncora%2C%20M%C3%A1ncora%2C%20Piura&t=&z=15&ie=UTF8&iwloc=&output=embed"][title="Ubicación de la clase"][aria-label="Mapa mostrando la ubicación en Playa Máncora"]')
        # Click 'Reservar ahora' button to open booking modal
        elem = frame.locator('xpath=html/body/div/div/div[3]/div[13]/div/div/button/div[2]/div/div/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Fill participant details partially without logging in.
        frame = context.pages[-1]
        # Click 'Iniciar Sesión' to simulate login later if needed
        elem = frame.locator('xpath=html/body/header/div/div/div/a/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Perform login with provided credentials to test if booking data is preserved after login.
        frame = context.pages[-1]
        # Input username for login
        elem = frame.locator('xpath=html/body/div[2]/div/div[2]/div/form/div/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('admin@test.com')
        

        frame = context.pages[-1]
        # Input password for login
        elem = frame.locator('xpath=html/body/div[2]/div/div[2]/div/form/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('admin123')
        

        frame = context.pages[-1]
        # Click 'Iniciar Sesión' button to login
        elem = frame.locator('xpath=html/body/div[2]/div/div[2]/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Navigate back to booking page to continue booking as guest and verify data preservation without login.
        frame = context.pages[-1]
        # Click 'Volver al inicio' to return to main booking page
        elem = frame.locator('xpath=html/body/div[2]/div/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Navigate to /classes/3 again and open booking modal to check if previously entered booking data is preserved.
        frame = context.pages[-1]
        # Click 'Clases' menu to navigate to classes list
        elem = frame.locator('xpath=html/body/header/div/div/nav/a[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Click 'Reservar Ahora' button for the specific class to open booking modal
        elem = frame.locator('xpath=html/body/div[3]/div/div/div/div/div[2]/h3').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Close or accept the cookie consent panel to unblock the page and then click 'Reservar Ahora' button again to open booking modal.
        frame = context.pages[-1]
        # Click 'Cerrar banner de cookies' button to close cookie consent panel
        elem = frame.locator('xpath=html/body/div[3]/div/div/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click 'Reservar Ahora' button for the first class to open booking modal and check if previously entered booking data is preserved.
        frame = context.pages[-1]
        # Click 'Reservar Ahora' button for first class to open booking modal
        elem = frame.locator('xpath=html/body/div[2]/main/section/div/div[2]/div/div/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click 'Reservar ahora' button to proceed with guest booking and complete the reservation.
        frame = context.pages[-1]
        # Click 'Reservar ahora' button to proceed with booking as guest
        elem = frame.locator('xpath=html/body/div[2]/div[2]/div[3]/div[2]/div/div/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Fill in the personal information fields (name, email, age, participants) and click 'Siguiente' to proceed to the next step.
        frame = context.pages[-1]
        # Fill in full name
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/form/div/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Juan Pérez')
        

        frame = context.pages[-1]
        # Fill in email address
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/form/div/div[2]/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('juan@ejemplo.com')
        

        frame = context.pages[-1]
        # Fill in age
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/form/div/div[2]/div[3]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('25')
        

        frame = context.pages[-1]
        # Click 'Siguiente' button to proceed to next step
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/div[2]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Fill in personalization details and click 'Siguiente' to proceed to the next step.
        frame = context.pages[-1]
        # Fill in height in cm
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/form/div/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('170')
        

        frame = context.pages[-1]
        # Fill in weight in kg
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/form/div/div[2]/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('70')
        

        frame = context.pages[-1]
        # Check 'Sé nadar' checkbox
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/form/div/div[3]/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Fill in medical condition text area
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/form/div/div[4]/textarea').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Ninguna lesión o condición médica')
        

        frame = context.pages[-1]
        # Click 'Siguiente' button to proceed to next step
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/div[2]/div/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Fill in emergency contact name and phone, then click 'Confirmar Reserva' to complete the booking as guest.
        frame = context.pages[-1]
        # Fill emergency contact name
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/form/div/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Maria Lopez')
        

        frame = context.pages[-1]
        # Fill emergency contact phone
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/form/div/div[2]/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('+51987654321')
        

        frame = context.pages[-1]
        # Click 'Confirmar Reserva' button to complete booking
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/div[2]/div/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click 'Continuar como Invitado' button to finalize the booking as a guest and verify reservation creation.
        frame = context.pages[-1]
        # Click 'Continuar como Invitado' button to finalize booking as guest
        elem = frame.locator('xpath=html/body/div[2]/div/div[3]/div/div/div[2]/div/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click 'Confirmar Datos y Reservar' button to finalize the booking and verify reservation creation.
        frame = context.pages[-1]
        # Click 'Confirmar Datos y Reservar' button to finalize booking
        elem = frame.locator('xpath=html/body/div[2]/div/div[3]/div/div/div/div[3]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Try to correct the 'Edad' field input by clearing and re-entering a valid age, then attempt to submit the form again.
        frame = context.pages[-1]
        # Clear the 'Edad' field to reset validation
        elem = frame.locator('xpath=html/body/div[2]/div/div[3]/div/div/div/div[2]/div/div[2]/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('')
        

        frame = context.pages[-1]
        # Re-enter valid age '25' in the 'Edad' field
        elem = frame.locator('xpath=html/body/div[2]/div/div[3]/div/div/div/div[2]/div/div[2]/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('25')
        

        frame = context.pages[-1]
        # Click 'Confirmar Datos y Reservar' button again to attempt submission
        elem = frame.locator('xpath=html/body/div[2]/div/div[3]/div/div/div/div[3]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        try:
            await expect(frame.locator('text=Booking data preserved after navigation and login').first).to_be_visible(timeout=1000)
        except AssertionError:
            raise AssertionError("Test failed: Booking data was not preserved after navigating away and returning or logging in during the booking process as required by the test plan.")
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    