/**
 * Shallow equality check for primitives and plain objects.
 * Returns true if values are strictly equal (via `Object.is`) or if both
 * are non-null objects with the same own enumerable keys and each corresponding
 * value is strictly equal.
 */
export function shallowEqual(a: unknown, b: unknown): boolean {
	if (Object.is(a, b)) return true;
	if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
		return false;
	}
	const aKeys = Object.keys(a as Record<string, unknown>);
	const bKeys = Object.keys(b as Record<string, unknown>);
	if (aKeys.length !== bKeys.length) return false;
	for (const key of aKeys) {
		if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
		if (!Object.is((a as any)[key], (b as any)[key])) return false;
	}
	return true;
}
