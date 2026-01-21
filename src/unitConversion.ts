export function semitonesToFrequencyMult(semitone: number): number {
  return Math.pow(2, semitone / 12);
}

export function centsToFrequencyMult(cents: number): number {
  return Math.pow(2, cents / 1200);
}