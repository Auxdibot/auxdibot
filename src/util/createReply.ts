import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { BaseInteraction, InteractionReplyOptions, InteractionResponse, Message, MessagePayload } from 'discord.js';
import { AuxdibotReplyOptions } from '../interfaces/AuxdibotReplyOptions';
import handleLog from './handleLog';

/**
 * Creates a reply for an interaction.
 * @param this - The context of the Auxdibot instance.
 * @param interaction - The interaction object representing the user's interaction.
 * @param data - The data for the reply.
 * @param options - Additional options for creating the reply.
 * @returns A promise that resolves to the created message or interaction response.
 */
export async function createReply(
   this: Auxdibot,
   interaction: BaseInteraction,
   data: InteractionReplyOptions,
   options?: AuxdibotReplyOptions,
): Promise<Message<boolean> | InteractionResponse<boolean>> | null {
   if (interaction.guildId && interaction.isChatInputCommand() && !options?.noOutputChannel) {
      const server = await findOrCreateServer(this, interaction.guildId);
      if (!server) return;
      const permission = server.command_permissions.filter((cp) => cp.command == interaction.commandName),
         commandPermission = permission.find((i) => !i.subcommand && !i.group),
         groupPermission = permission.find(
            (i) => i.group == interaction.options.getSubcommandGroup(false) && !i.subcommand,
         ),
         subcommandPermission = permission.find(
            (i) =>
               i.group == interaction.options.getSubcommandGroup(false) &&
               i.subcommand == interaction.options.getSubcommand(false),
         );
      if (
         commandPermission?.channel_output ||
         groupPermission?.channel_output ||
         subcommandPermission?.channel_output
      ) {
         const channel = await interaction.guild?.channels
            .fetch(
               subcommandPermission?.channel_output ||
                  groupPermission?.channel_output ||
                  commandPermission?.channel_output,
            )
            .catch(() => undefined);
         if (channel && channel.isTextBased()) {
            return channel
               .send(new MessagePayload(channel, data))
               .then((msg) => {
                  this.createReply(
                     interaction,
                     {
                        content: `Redirected to: https://discord.com/channels/${interaction.guildId}/${channel.id}/${msg.id}`,
                        ephemeral: true,
                     },
                     { noOutputChannel: true },
                  );
               })
               .catch(() => {
                  handleLog(
                     this,
                     interaction.guild,
                     {
                        type: 'ERROR',
                        description: `An error occurred when attempting to run a command.`,
                        userID: interaction.user.id,
                        date_unix: Date.now(),
                     },
                     [
                        {
                           name: 'Error Message',
                           value: `Failed to redirect command output to <#${channel.id}>`,
                           inline: false,
                        },
                     ],
                  );
                  this.createReply(interaction, data, { noOutputChannel: true });
               });
         }
      }
   }
   return (
      interaction.isRepliable() && interaction.deferred
         ? interaction.editReply(data)
         : interaction.isRepliable() && !interaction.replied
         ? interaction.reply(data)
         : interaction.channel.send(new MessagePayload(interaction.channel, data))
   ).catch((x) => {
      console.error('! -> Auxdibot failed to send a message!');
      console.error(x);
      return null;
   });
}
