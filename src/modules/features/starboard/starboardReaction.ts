import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import {
   Guild,
   GuildBasedChannel,
   Message,
   MessageReaction,
   PartialMessageReaction,
   PartialUser,
   User,
} from 'discord.js';
import updateStarredMessage from './messages/updateStarredMessage';
import createStarredMessage from './messages/createStarredMessage';
import deleteStarredMessage from './messages/deleteStarredMessage';
import { calculateTotalStars } from './calculateTotalStars';

/**
 * Handles the starboard reaction event, and checks if the user has reacted with a valid starboard reaction.
 *
 * @param auxdibot - The instance of the Auxdibot.
 * @param reaction - The reacted message reaction.
 * @param user - The user who reacted.
 */
export async function starboardReaction(
   auxdibot: Auxdibot,
   reaction: MessageReaction | PartialMessageReaction,
   user: User | PartialUser,
) {
   const guild: Guild | undefined = await reaction.message.guild.fetch().catch(() => undefined);
   if (!guild) return;
   const reactionsFetched: MessageReaction | undefined = await reaction.fetch().catch(() => undefined);
   if (!reactionsFetched) return;
   const server = await findOrCreateServer(auxdibot, guild.id);
   if (server.disabled_modules.find((item) => item == Modules['Starboard'].name)) return;
   const board = server.starboard_boards.find(
      (i) => i.reaction == (reaction.emoji.valueOf() ?? reaction.emoji.toString()),
   );
   if (!board) return;
   const starred_message = server.starred_messages.find(
      (i) =>
         (i.starboard_message_id == reaction.message.id || i.starred_message_id == reaction.message.id) &&
         i.board == board.board_name,
   );

   if (server.starred_messages.some((i) => i.starboard_message_id == reaction.message.id) && !server.starboard_star)
      return;

   if (reaction.message.author.id == user.id && !server.self_star) return;
   const channel: GuildBasedChannel | undefined = await guild.channels.fetch(board.channelID).catch(() => undefined);
   if (!channel || !channel.isTextBased()) return;
   const starboard_message: Message<true> | undefined = starred_message?.starboard_message_id
      ? await channel.messages.fetch(starred_message?.starboard_message_id).catch(() => undefined)
      : undefined;

   if (starred_message && !starboard_message) {
      await deleteStarredMessage(auxdibot, board, reactionsFetched);
   }
   const count = await calculateTotalStars(
      auxdibot,
      guild,
      board,
      starred_message ?? {
         starred_message_id: reaction.message.id,
         starboard_message_id: undefined,
         board: board.board_name,
      },
   );
   if (count < board.count) {
      if (starboard_message) {
         await deleteStarredMessage(auxdibot, board, reactionsFetched);
      }
      return;
   }
   if (starred_message) {
      await updateStarredMessage(auxdibot, guild, board, starred_message, count);
   } else {
      await createStarredMessage(auxdibot, guild, board, reactionsFetched.message, count);
   }
}
