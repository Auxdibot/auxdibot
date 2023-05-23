import { APIEmbed, GuildMember, MessageReaction, User } from 'discord.js';
import Server from '@models/server/Server';
import Modules from '@util/constants/Modules';
import parsePlaceholders from '@util/functions/parsePlaceholder';

module.exports = {
   name: 'messageReactionRemove',
   once: false,
   async execute(messageReaction: MessageReaction, user: User) {
      if (user.id == messageReaction.client.user.id) return undefined;
      if (!messageReaction.message.guild) return;
      const server = await Server.findOrCreateServer(messageReaction.message.guild.id);
      const data = await server.fetchData(),
         settings = await server.fetchSettings();
      const member: GuildMember | null = messageReaction.message.guild.members.resolve(user.id);
      if (!member || !messageReaction.message.guild) return undefined;
      if (!settings.disabled_modules.find((item) => item == Modules['Suggestions'].name)) {
         const suggestion = data.suggestions.find((suggestion) => suggestion.message_id == messageReaction.message.id);
         if (suggestion) {
            const findReaction = settings.suggestions_reactions.find(
               (reaction) => reaction.emoji == messageReaction.emoji.toString(),
            );
            if (findReaction) {
               suggestion.rating -= findReaction.rating;
               await data.save({ validateModifiedOnly: true });
               await data.updateSuggestion(messageReaction.message.guild, suggestion);
            }
         }
      }
      if (!settings.disabled_modules.find((item) => item == Modules['Starboard'].name)) {
         const starred = data.starred_messages.find((i) => i.starred_message_id == messageReaction.message.id);
         const starboard_channel = messageReaction.message.guild.channels.cache.get(settings.starboard_channel);
         const starCount =
            (await messageReaction.message.reactions.cache.get(settings.starboard_reaction)?.fetch())?.count || 0;
         if (starboard_channel && starboard_channel.isTextBased()) {
            if (starred && starCount < settings.starboard_reaction_count) {
               const message = starboard_channel.messages.cache.get(starred.message_id);
               try {
                  await message.delete();
                  data.starred_messages.splice(data.starred_messages.indexOf(starred), 1);
                  await data.save({ validateBeforeSave: false });
               } catch (x) {}
            } else if (starred) {
               const message = starboard_channel.messages.cache.get(starred.message_id);
               if (message) {
                  try {
                     const embed = JSON.parse(
                        await parsePlaceholders(
                           JSON.stringify(settings.starboard_embed),
                           messageReaction.message.guild,
                           undefined,
                           undefined,
                           messageReaction.message,
                        ),
                     ) as APIEmbed;
                     await message.edit({
                        content: `**${starCount} ${settings.starboard_reaction || 'No Emoji'}** | ${
                           messageReaction.message.channel
                        }`,
                        embeds: [embed],
                     });
                  } catch (x) {}
               } else {
                  data.starred_messages.splice(data.starred_messages.indexOf(starred), 1);
                  await data.save({ validateBeforeSave: false });
               }
            }
         }
      }
   },
};
