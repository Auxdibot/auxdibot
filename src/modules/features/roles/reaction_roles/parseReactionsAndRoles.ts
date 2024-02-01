import { ReactionsAndRolesBuilder } from '@/interfaces/reactions/ReactionsAndRolesBuilder';
import { Guild, Role } from 'discord.js';
import emojiRegex from 'emoji-regex';

export async function parseReactionsAndRoles(auxdibot, guild: Guild, reactions: { emoji: string; roleID: string }[]) {
   return await reactions.reduce(
      async (acc: Promise<ReactionsAndRolesBuilder[]> | ReactionsAndRolesBuilder[], item) => {
         let arr = await acc;
         const role: Role = await guild.roles.fetch((item.roleID?.match(/\d+/) || [])[0] || '').catch(() => undefined);
         const serverEmoji = auxdibot.emojis.cache.get((item.emoji?.match(/\d+/) || [])[0])?.id;
         const emoji = serverEmoji ?? (emojiRegex().test(item.emoji) ? item.emoji : undefined);
         if (role && role.guild && role.position > role.guild.members.me.roles.highest.position)
            throw new Error(`The ${role.name} role is higher than Auxdibot's highest role!`);
         if (role && emoji && typeof emoji == 'string')
            arr.length == 0
               ? (arr = [{ role: role, emoji: emoji.valueOf() ?? emoji.toString() }])
               : arr.push({ role: role, emoji: emoji.valueOf() ?? emoji.toString() });
         return arr;
      },
      [],
   );
}
