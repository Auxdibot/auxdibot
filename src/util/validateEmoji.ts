import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildEmoji } from 'discord.js';
import emojiRegex from 'emoji-regex';

const regex = emojiRegex();

/**
 * Validates if an emoji string is valid.
 * @param auxdibot - The Auxdibot instance.
 * @param emojiStr - The emoji string to validate.
 * @returns The emoji if the emoji is valid, otherwise undefined.
 */
export function validateEmoji(auxdibot: Auxdibot, emojiStr: string): string | GuildEmoji | undefined {
   const emojis = emojiStr.match(regex);
   const emoji = auxdibot.emojis.cache.find((i) => i.valueOf() == emojiStr) || (emojis != null ? emojis[0] : null);
   return emoji;
}
