// Test setup to verify all dependencies are working correctly
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'

// Test Zod validation
const testSchema = z.object({
  name: z.string(),
  email: z.string().email(),
})

export function testValidation() {
  try {
    const result = testSchema.parse({
      name: 'Test User',
      email: 'test@example.com'
    })
    console.log('✅ Zod validation working:', result)
    return true
  } catch (error) {
    console.error('❌ Zod validation failed:', error)
    return false
  }
}

// Test Prisma client instantiation
export function testPrismaClient() {
  try {
    const prisma = new PrismaClient()
    console.log('✅ Prisma client created successfully')
    return true
  } catch (error) {
    console.error('❌ Prisma client creation failed:', error)
    return false
  }
}

export function runAllTests() {
  console.log('🧪 Running setup tests...')
  const zodTest = testValidation()
  const prismaTest = testPrismaClient()
  
  if (zodTest && prismaTest) {
    console.log('✅ All setup tests passed!')
    return true
  } else {
    console.log('❌ Some setup tests failed')
    return false
  }
}