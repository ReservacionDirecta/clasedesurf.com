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
        # -> Click the 'Reservar ahora' button to open the booking modal.
        frame = context.pages[-1].frame_locator('html > body > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(3) > div > section:nth-of-type(4) > div > div > iframe.w-full.h-full.grayscale-10.transition-all.duration-700[src="https://maps.google.com/maps?q=Playa%20Playa%20M%C3%A1ncora%2C%20M%C3%A1ncora%2C%20Piura&t=&z=15&ie=UTF8&iwloc=&output=embed"][title="Ubicación de la clase"][aria-label="Mapa mostrando la ubicación en Playa Máncora"]')
        # Click the 'Reservar ahora' button to open the booking modal for booking.
        elem = frame.locator('xpath=html/body/div/div/div[3]/div[12]/div/gmp-internal-camera-control/button/img').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Try to accept cookies banner to remove any overlay that might block interaction, then retry clicking 'Reservar ahora' button.
        frame = context.pages[-1]
        # Click 'Aceptar todas' button to accept cookies and remove cookie banner overlay.
        elem = frame.locator('xpath=html/body/div[3]/div/div/div[2]/button[3]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'Reservar ahora' button (index 40) again to open the booking modal.
        frame = context.pages[-1]
        # Click the 'Reservar ahora' button to open the booking modal for booking.
        elem = frame.locator('xpath=html/body/div[2]/div[2]/div[3]/div[2]/div/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'Reservar ahora' button at index 44 to open the booking modal.
        frame = context.pages[-1]
        # Click the 'Reservar ahora' button to open the booking modal.
        elem = frame.locator('xpath=html/body/div[2]/div[2]/div[3]/div[2]/div/div/div[2]/div[2]/div/select').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'Reservar ahora' button (index 45) to proceed with booking.
        frame = context.pages[-1]
        # Click the 'Reservar ahora' button to proceed with booking.
        elem = frame.locator('xpath=html/body/div[2]/div[2]/div[3]/div[2]/div/div/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Fill in the personal information form with valid data: name, email, age, and select participants.
        frame = context.pages[-1]
        # Fill in the full name field.
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/form/div/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Juan Pérez')
        

        frame = context.pages[-1]
        # Fill in the email field with a valid email.
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/form/div/div[2]/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('juan.perez@example.com')
        

        frame = context.pages[-1]
        # Fill in the age field.
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/form/div/div[2]/div[3]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('30')
        

        # -> Correct the email input to a valid format and then click the 'Siguiente' button to proceed.
        frame = context.pages[-1]
        # Re-enter email with correct format to fix validation error.
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/form/div/div[2]/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('juan.perez@example.com')
        

        frame = context.pages[-1]
        # Click the 'Siguiente' button to proceed to the next step in the booking modal.
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/div[2]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Clear and re-enter a valid weight value in the weight field to resolve the validation error, then click 'Siguiente' to proceed.
        frame = context.pages[-1]
        # Clear the weight field to remove invalid input.
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/form/div/div[2]/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('')
        

        # -> Enter a valid weight value (e.g., 65) in the weight field and then click the 'Siguiente' button to proceed.
        frame = context.pages[-1]
        # Enter a valid weight value in the weight field.
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/form/div/div[2]/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('65')
        

        # -> Try to uncheck and recheck the 'Sé nadar' checkbox (index 49) to see if it affects validation, then click 'Siguiente' button (index 53) to proceed.
        frame = context.pages[-1]
        # Toggle the 'Sé nadar' checkbox to potentially trigger validation update.
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/form/div/div[3]/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Clear the weight field again and enter a valid weight value, then click 'Siguiente' button to proceed.
        frame = context.pages[-1]
        # Clear the weight field to remove invalid input.
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/form/div/div[2]/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('')
        

        # -> Try entering a different valid weight value (e.g., 60) in the weight field and then click the 'Siguiente' button to proceed.
        frame = context.pages[-1]
        # Enter a different valid weight value in the weight field.
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/form/div/div[2]/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('60')
        

        # -> Try clicking the 'Siguiente' button (index 53) to see if the form allows proceeding despite the weight field validation error.
        frame = context.pages[-1]
        # Click the 'Siguiente' button to attempt to proceed to the next step.
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/div[2]/div/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Fill in emergency contact name and a valid emergency phone number, then click 'Confirmar Reserva' button to complete the reservation.
        frame = context.pages[-1]
        # Fill in emergency contact name.
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/form/div/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Maria Lopez')
        

        frame = context.pages[-1]
        # Fill in valid emergency phone number.
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/form/div/div[2]/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('+51987654321')
        

        frame = context.pages[-1]
        # Click 'Confirmar Reserva' button to complete the reservation.
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div/div[2]/div/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=Completa tu Reserva').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Estás a solo unos pasos de vivir una experiencia increíble en el mar.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Revisión').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Participantes').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Pago').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Surf Experience Máncora').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=miércoles, 28 de enero de 2026').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Por definir').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=NIVEL: BEGINNER').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Puedes continuar como invitado o iniciar sesión para guardar esta reserva en tu historial.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Crearemos una cuenta automática para ti con los datos de la reserva.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Continuar como Invitado').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Si ya tienes cuenta, inicia sesión para acumular puntos.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Iniciar Sesión').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=S/ 90').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Subtotal por persona').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Cantidad alumnos').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=x 1').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=miércoles, 28 de enero de 2026').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=09:00 - 11:30').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Confirmación inmediata').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Cancelación flexible (24h)').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    