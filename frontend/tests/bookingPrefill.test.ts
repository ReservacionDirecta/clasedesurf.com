import { describe, it, expect } from 'vitest'
import { deriveInitialParticipants } from '../src/utils/bookingPrefill'

describe('Booking prefill utility', () => {
  it('prefills first participant name from session when available', () => {
    const num = 2
    const res = deriveInitialParticipants(num, 'Guest User', 'Session User')
    expect(res[0].name).toBe('Session User')
  })

  it('prefills first participant name from booking data when no session', () => {
    const num = 1
    const res = deriveInitialParticipants(num, 'Guest Name', undefined)
    expect(res[0].name).toBe('Guest Name')
  })

  it('leaves first participant name empty if neither session nor booking name provided', () => {
    const num = 1
    const res = deriveInitialParticipants(num, undefined, undefined)
    expect(res[0].name).toBe('')
  })
})
