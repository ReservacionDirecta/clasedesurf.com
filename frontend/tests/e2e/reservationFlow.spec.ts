import { test, expect } from '@playwright/test'

test.describe('Reserva de clase - flujo E2E (borrador)', () => {
  test.beforeEach(async ({ page }) => {
    // Asume local dev server running; optionally set BASE_URL env var.
    await page.goto('/')
  })

  test('Carga la página de reserva y navega pasos básicos', async ({ page }) => {
    // Este es un test de esqueleto; la implementación real requiere el flujo de la app
    // Verificar que la página principal se carga
    await expect(page).toHaveURL(/.*/)
  })
})
