import { describe, it, expect } from 'vitest'
import { createReservationSchema } from '../src/validations/reservations'

describe('Reservation validations (backend)', () => {
  it('valid input passes schema', () => {
    const input = {
      classId: 1,
      participants: 1
    }
    expect(() => createReservationSchema.parse(input)).not.toThrow()
  })

  it('invalid age in participant should fail', () => {
    const input = {
      classId: 1,
      participants: [
        {
          name: 'Test',
          age: '7',
          height: '120',
          weight: '40',
          canSwim: true,
          hasSurfedBefore: false,
        }
      ]
    }
    expect(() => createReservationSchema.parse(input)).toThrow()
  })

  it('invalid height in participant should fail', () => {
    const input = {
      classId: 1,
      participants: [
        {
          name: 'Test',
          age: '12',
          height: '90',
          weight: '40',
          canSwim: true,
          hasSurfedBefore: false,
        }
      ]
    }
    expect(() => createReservationSchema.parse(input)).toThrow()
  })
})
