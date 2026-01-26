export interface Participant {
  name: string;
  age?: string;
  height?: string;
  weight?: string;
  canSwim?: boolean;
  swimmingLevel?: string;
  hasSurfedBefore?: boolean;
  injuries?: string;
  comments?: string;
}

export function deriveInitialParticipants(
  numParticipants: number,
  bookingName?: string,
  sessionName?: string
) : Participant[] {
  const parts: Participant[] = []
  for (let i = 0; i < numParticipants; i++) {
    parts.push({
      name: i === 0 ? (sessionName || bookingName || '') : '',
      age: '',
      height: '',
      weight: '',
      canSwim: false,
      swimmingLevel: 'BEGINNER',
      hasSurfedBefore: false,
      injuries: '',
      comments: ''
    })
  }
  return parts
}
