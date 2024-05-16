/**
 * Verifies if a string is a valid hexadecimal color code.
 *
 * @param str - The string to be verified.
 * @returns A boolean indicating whether the string is a valid hexadecimal color code.
 */
export function verifyHex(str: string) {
   return /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(str);
}
