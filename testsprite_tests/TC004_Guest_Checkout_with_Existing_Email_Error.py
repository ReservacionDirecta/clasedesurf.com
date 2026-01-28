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
        # -> Open the booking modal by clicking the 'Reservar ahora' button to start guest checkout.
        frame = context.pages[-1].frame_locator('html > body > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(3) > div > section:nth-of-type(4) > div > div > iframe.w-full.h-full.grayscale-10.transition-all.duration-700[src="https://maps.google.com/maps?q=Playa%20Playa%20M%C3%A1ncora%2C%20M%C3%A1ncora%2C%20Piura&t=&z=15&ie=UTF8&iwloc=&output=embed"][title="Ubicación de la clase"][aria-label="Mapa mostrando la ubicación en Playa Máncora"]')
        # Click 'Reservar ahora' button to open booking modal for guest checkout.
        elem = frame.locator('xpath=html/body/div/div/div[3]/div[12]/div/gmp-internal-camera-control/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Fill participant details with an existing user email to simulate guest checkout attempt.
        await page.mouse.wheel(0, await page.evaluate('() => window.innerHeight'))
        

        # -> Click participant dropdown to select 1 participant, then click 'Reservar ahora' to proceed to guest checkout form.
        frame = context.pages[-1]
        # Click participant dropdown to open selection options
        elem = frame.locator('xpath=html/body/div[2]/div/div/div/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Focus on filling guest checkout form: select 1 participant from dropdown, then click 'Reservar ahora' to proceed to guest checkout form.
        frame = context.pages[-1]
        # Select 1 participant from dropdown
        elem = frame.locator('xpath=html/body/div[2]/div[2]/div[3]/div[2]/div/div/div[2]/div[2]/div/select').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Click 'Reservar ahora' button to proceed to guest checkout form
        elem = frame.locator('xpath=html/body/div[2]/div[2]/div[3]/div[2]/div/div/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Fill guest checkout form with full name, existing registered email (admin@test.com), age, and participants, then submit the form.
        frame = context.pages[-1]
        # Input full name in guest checkout form
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/form/div/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Test User')
        

        frame = context.pages[-1]
        # Input existing registered email in guest checkout form
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/form/div/div[2]/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('admin@test.com')
        

        frame = context.pages[-1]
        # Input age in guest checkout form
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/form/div/div[2]/div[3]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('30')
        

        frame = context.pages[-1]
        # Click 'Siguiente' button to submit guest checkout form
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/div[2]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Fill the experience details form with sample data and submit to complete the guest checkout process.
        frame = context.pages[-1]
        # Input height in cm
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/form/div/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('170')
        

        frame = context.pages[-1]
        # Input weight in kg
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/form/div/div[2]/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('70')
        

        frame = context.pages[-1]
        # Click 'Sé nadar' checkbox
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/form/div/div[3]/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Input medical condition details
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/form/div/div[4]/textarea').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Ej. Lesión antigua en hombro derecho...')
        

        frame = context.pages[-1]
        # Click 'Siguiente' button to submit experience details and continue
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        try:
            await expect(page.locator('text=Guest checkout completed successfully')).to_be_visible(timeout=5000)
        except AssertionError:
            raise AssertionError('Test failed: Guest checkout attempt with existing user email did not return the expected error indicating the email already exists.')
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    