import { GuildMember, MessageReaction, User } from 'discord.js';
import Server from '../mongo/model/server/Server';
import { IReaction, IReactionRole } from '../mongo/schema/ReactionRoleSchema';

module.exports = {
   name: 'messageReactionAdd',
   once: false,
   async execute(messageReaction: MessageReaction, user: User) {
      if (user.id == messageReaction.client.user.id) return;
      if (!messageReaction.message.guild) return;
      const server = await Server.findOrCreateServer(messageReaction.message.guild.id);
      const data = await server.fetchData(),
         settings = await server.fetchSettings();
      const member: GuildMember | null = messageReaction.message.guild.members.resolve(user.id);
      if (!member) return;
      const rrData = data.reaction_roles.find((rr: IReactionRole) => messageReaction.message.id == rr.message_id);
      if (rrData) {
         const rr = rrData.reactions.find((react: IReaction) => react.emoji == messageReaction.emoji.toString());
         if (rr) {
            await messageReaction.users.remove(user.id);
            if (member.roles.resolve(rr.role)) {
               await member.roles.remove(rr.role).catch(() => undefined);
            } else {
               await member.roles.add(rr.role).catch(() => undefined);
            }
         }
      }
      const suggestion = data.suggestions.find((suggestion) => suggestion.message_id == messageReaction.message.id);
      if (suggestion) {
         const findReaction = settings.suggestions_reactions.find(
            (reaction) => reaction.emoji == messageReaction.emoji.toString(),
         );
         if (findReaction) {
            suggestion.rating += findReaction.rating;
            await data.save();
            await data.updateSuggestion(messageReaction.message.guild, suggestion);
         }
      }
   },
};
