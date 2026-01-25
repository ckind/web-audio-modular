export function semitonesToFrequencyMult(semitone: number): number {
  return Math.pow(2, semitone / 12);
}

export function centsToFrequencyMult(cents: number): number {
  return Math.pow(2, cents / 1200);
}

export function isNormalRange(value: any): value is number {
  return typeof value === "number" && value >= 0 && value <= 1;
};

export function isMidiRange(value: any): value is number {
  return Number.isInteger(value) && value >= 0 && value <= 127;
};

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
};