import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { BaseInteraction, InteractionReplyOptions, MessagePayload } from 'discord.js';
import { AuxdibotReplyOptions } from '../interfaces/AuxdibotReplyOptions';

export async function createReply(
   this: Auxdibot,
   interaction: BaseInteraction,
   data: InteractionReplyOptions,
   options?: AuxdibotReplyOptions,
): Promise<void> {
   if (interaction.guildId && interaction.isChatInputCommand() && !options?.noOutputChannel) {
      const server = await findOrCreateServer(this, interaction.guildId);
      if (!server) return;
      const permission = server.command_permissions.find(
         (item) =>
            item.command == interaction.commandName &&
            item.subcommand == interaction.options.getSubcommand() &&
            item.group == interaction.options.getSubcommandGroup(),
      );
      if (permission?.channel_output) {
         const channel = interaction.guild?.channels.cache.get(permission.channel_output);
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
                  this.createReply(interaction, data, { noOutputChannel: true });
               });
         }
      }
   }

   interaction.isRepliable() && interaction.deferred
      ? interaction.editReply(data)
      : interaction.isRepliable() && !interaction.replied
      ? interaction.reply(data)
      : interaction.channel.send(new MessagePayload(interaction.channel, data));
}
