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
        # -> Click the 'Reservar ahora' button to open the booking modal for guest checkout.
        frame = context.pages[-1].frame_locator('html > body > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(3) > div > section:nth-of-type(4) > div > div > iframe.w-full.h-full.grayscale-10.transition-all.duration-700[src="https://maps.google.com/maps?q=Playa%20Playa%20M%C3%A1ncora%2C%20M%C3%A1ncora%2C%20Piura&t=&z=15&ie=UTF8&iwloc=&output=embed"][title="Ubicación de la clase"][aria-label="Mapa mostrando la ubicación en Playa Máncora"]')
        # Click 'Reservar ahora' button to open booking modal
        elem = frame.locator('xpath=html/body/div/div/div[3]/div[12]/div/gmp-internal-camera-control/button/img').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'Reservar ahora' button (index 39) to open the booking modal for guest checkout.
        frame = context.pages[-1]
        # Click 'Reservar ahora' button to open booking modal
        elem = frame.locator('xpath=html/body/div[2]/div[2]/div[3]/div[2]/div/div/div[2]/div[2]/div/select').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Close cookie banner to avoid interference, then locate and fill participant details input fields in the booking modal.
        frame = context.pages[-1]
        # Click 'Cerrar banner de cookies' button to close cookie consent banner
        elem = frame.locator('xpath=html/body/div[3]/div/div/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        await page.mouse.wheel(0, 300)
        

        # -> Click 'Reservar ahora' button to attempt to complete reservation as guest with selected participant number.
        frame = context.pages[-1]
        # Click 'Reservar ahora' button to complete reservation as guest
        elem = frame.locator('xpath=html/body/div[2]/div[2]/div[3]/div[2]/div/div/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Fill participant details in the reservation form modal and click 'Siguiente' to proceed.
        frame = context.pages[-1]
        # Input full name in reservation form
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/form/div/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('John Doe')
        

        frame = context.pages[-1]
        # Input email in reservation form
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/form/div/div[2]/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('john.doe@example.com')
        

        frame = context.pages[-1]
        # Input age in reservation form
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/form/div/div[2]/div[3]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('30')
        

        frame = context.pages[-1]
        # Click 'Siguiente' button to proceed with reservation
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/div[2]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click 'Siguiente' button to proceed to the next step in the reservation process.
        frame = context.pages[-1]
        # Click 'Siguiente' button to proceed to next step in reservation process
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/div[2]/div/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Input valid emergency contact name and phone number, then click 'Confirmar Reserva' button to complete guest reservation.
        frame = context.pages[-1]
        # Input valid emergency contact name
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/form/div/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Jane Doe')
        

        frame = context.pages[-1]
        # Input valid emergency phone number
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/form/div/div[2]/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('+51987654321')
        

        frame = context.pages[-1]
        # Click 'Confirmar Reserva' button to complete reservation
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/div[2]/div/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click 'Continuar como Invitado' button to finalize the reservation as guest and verify reservation creation.
        frame = context.pages[-1]
        # Click 'Continuar como Invitado' button to finalize reservation as guest
        elem = frame.locator('xpath=html/body/div[2]/div/div[3]/div/div/div[2]/div/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click 'Confirmar Datos y Reservar' button to finalize the reservation and complete the guest checkout flow.
        frame = context.pages[-1]
        # Click 'Confirmar Datos y Reservar' button to finalize reservation
        elem = frame.locator('xpath=html/body/div[2]/div/div[3]/div/div/div/div[3]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Clear and input a valid age value (e.g., 25) in the age field, then click 'Confirmar Datos y Reservar' button again to proceed.
        frame = context.pages[-1]
        # Clear the age input field to fix validation error
        elem = frame.locator('xpath=html/body/div[2]/div/div[3]/div/div/div/div[2]/div/div[2]/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('')
        

        frame = context.pages[-1]
        # Input valid age value to fix validation error
        elem = frame.locator('xpath=html/body/div[2]/div/div[3]/div/div/div/div[2]/div/div[2]/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('25')
        

        frame = context.pages[-1]
        # Click 'Confirmar Datos y Reservar' button to finalize reservation
        elem = frame.locator('xpath=html/body/div[2]/div/div[3]/div/div/div/div[3]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Input valid height and weight values, then click 'Confirmar Datos y Reservar' button again to try to proceed.
        frame = context.pages[-1]
        # Input valid height in cm
        elem = frame.locator('xpath=html/body/div[2]/div/div[3]/div/div/div/div[2]/div/div[2]/div[3]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('170')
        

        frame = context.pages[-1]
        # Input valid weight in kg
        elem = frame.locator('xpath=html/body/div[2]/div/div[3]/div/div/div/div[2]/div/div[2]/div[3]/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('70')
        

        frame = context.pages[-1]
        # Click 'Confirmar Datos y Reservar' button to finalize reservation
        elem = frame.locator('xpath=html/body/div[2]/div/div[3]/div/div/div/div[3]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Try clearing and re-entering the age field with a different valid value (e.g., 26) and click 'Confirmar Datos y Reservar' button again to test if validation error clears.
        frame = context.pages[-1]
        # Clear the age input field to reset validation
        elem = frame.locator('xpath=html/body/div[2]/div/div[3]/div/div/div/div[2]/div/div[2]/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('')
        

        frame = context.pages[-1]
        # Input a different valid age value to test validation
        elem = frame.locator('xpath=html/body/div[2]/div/div[3]/div/div/div/div[2]/div/div[2]/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('26')
        

        frame = context.pages[-1]
        # Click 'Confirmar Datos y Reservar' button to try to proceed with new age value
        elem = frame.locator('xpath=html/body/div[2]/div/div[3]/div/div/div/div[3]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        try:
            await expect(frame.locator('text=Reservation Data Verified Successfully').first).to_be_visible(timeout=1000)
        except AssertionError:
            raise AssertionError("Test case failed: Analytics and statistics on school dashboards do not display accurate data about classes, reservations, and revenue as per the test plan.")
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    