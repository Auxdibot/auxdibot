/**
 * Tests if a given URL is a valid Discord invite link.
 * @param url - The URL to test.
 * @returns A boolean indicating whether the URL is a valid Discord invite link.
 */
export function testInvite(url: string) {
   return /(https?:\/\/|http?:\/\/)?(www.)?(discord.(gg|io|me|li)|discordapp.com\/invite|discord.com\/invite)\/[^\s\/]+?(?=\b)/.test(
      url,
   );
}
