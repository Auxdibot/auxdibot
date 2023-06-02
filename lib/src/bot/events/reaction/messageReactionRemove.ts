import { APIEmbed, MessageReaction, PartialMessageReaction, PartialUser, User } from 'discord.js';
import Modules from '@/constants/Modules';
import parsePlaceholders from '@/util/parsePlaceholder';
import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { DEFAULT_STARBOARD_MESSAGE_EMBED } from '@/constants/embeds/DefaultEmbeds';

export default async function messageReactionRemove(
   auxdibot: Auxdibot,
   messageReaction: MessageReaction | PartialMessageReaction,
   user: User | PartialUser,
) {
   if (user.id == messageReaction.client.user.id) return undefined;
   if (!messageReaction.message.guild) return;
   const server = await findOrCreateServer(auxdibot, messageReaction.message.guild.id);
   const member = messageReaction.message.guild.members.resolve(user.id);
   if (!member || !messageReaction.message.guild) return undefined;
   if (!server.disabled_modules.find((item) => item == Modules['Starboard'].name)) {
      const starred = server.starred_messages.find((i) => i.starred_message_id == messageReaction.message.id);
      const starboard_channel = messageReaction.message.guild.channels.cache.get(server.starboard_channel);
      const starCount =
         (await messageReaction.message.reactions.cache.get(server.starboard_reaction)?.fetch())?.count || 0;
      if (starboard_channel && starboard_channel.isTextBased()) {
         if (starred && starCount < server.starboard_reaction_count) {
            const message = starboard_channel.messages.cache.get(starred.starboard_message_id);
            try {
               await message.delete();
               server.starred_messages.splice(server.starred_messages.indexOf(starred), 1);
               await auxdibot.database.servers.update({
                  where: { serverID: messageReaction.message.guild.id },
                  data: { starred_messages: server.starred_messages },
               });
            } catch (x) {}
         } else if (starred) {
            const message = starboard_channel.messages.cache.get(starred.starboard_message_id);
            if (message) {
               try {
                  const embed = JSON.parse(
                     await parsePlaceholders(
                        auxdibot,
                        JSON.stringify(DEFAULT_STARBOARD_MESSAGE_EMBED),
                        messageReaction.message.guild,
                        undefined,
                        undefined,
                        messageReaction.message,
                     ),
                  ) as APIEmbed;
                  await message.edit({
                     content: `**${starCount} ${server.starboard_reaction || 'No Emoji'}** | ${
                        messageReaction.message.channel
                     }`,
                     embeds: [embed],
                  });
               } catch (x) {}
            } else {
               server.starred_messages.splice(server.starred_messages.indexOf(starred), 1);
               await auxdibot.database.servers
                  .update({
                     where: { serverID: messageReaction.message.guild.id },
                     data: { starred_messages: server.starred_messages },
                  })
                  .catch(() => undefined);
            }
         }
      }
   }
}
