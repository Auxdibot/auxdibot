import { GuildMember, MessageReaction, User } from 'discord.js';
import Server from '@models/server/Server';
import Modules from '@util/constants/Modules';

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
               await data.save();
               await data.updateSuggestion(messageReaction.message.guild, suggestion);
            }
         }
      }
   },
};
