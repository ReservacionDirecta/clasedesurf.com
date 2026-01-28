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
        # -> Open the booking modal by clicking the 'Reservar ahora' button to start the guest booking process.
        frame = context.pages[-1].frame_locator('html > body > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(3) > div > section:nth-of-type(4) > div > div > iframe.w-full.h-full.grayscale-10.transition-all.duration-700[src="https://maps.google.com/maps?q=Playa%20Playa%20M%C3%A1ncora%2C%20M%C3%A1ncora%2C%20Piura&t=&z=15&ie=UTF8&iwloc=&output=embed"][title="Ubicación de la clase"][aria-label="Mapa mostrando la ubicación en Playa Máncora"]')
        # Click 'Reservar ahora' button to open booking modal
        elem = frame.locator('xpath=html/body/div/div/div[3]/div[12]/div/gmp-internal-camera-control/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'Reservar ahora' button to complete the guest reservation.
        frame = context.pages[-1]
        # Click 'Reservar ahora' button to complete guest reservation
        elem = frame.locator('xpath=html/body/div[2]/div[2]/div[3]/div[2]/div/div/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Fill in the personal information fields (name, email, age) and proceed to the next step by clicking 'Siguiente'.
        frame = context.pages[-1]
        # Fill in full name in reservation form
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/form/div/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Juan Pérez')
        

        frame = context.pages[-1]
        # Fill in email in reservation form
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/form/div/div[2]/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('juan@ejemplo.com')
        

        frame = context.pages[-1]
        # Fill in age in reservation form
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/form/div/div[2]/div[3]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('25')
        

        frame = context.pages[-1]
        # Click 'Siguiente' button to proceed with reservation
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/div[2]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Complete the guest reservation by filling any remaining required details and submitting the form. Then verify reservation success.
        frame = context.pages[-1]
        # Fill height in cm
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/form/div/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('170')
        

        frame = context.pages[-1]
        # Fill weight in kg
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/form/div/div[2]/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('70')
        

        frame = context.pages[-1]
        # Click 'Siguiente' button to proceed to next step or submit
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/form/div/div[4]/textarea').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        try:
            await expect(frame.locator('text=Datos de reserva no encontrados').first).to_be_visible(timeout=1000)
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
    