import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { deleteStoredEmbed } from '@/modules/features/embeds/deleteStoredEmbed';
import handleError from '@/util/handleError';
import { EmbedBuilder } from 'discord.js';

export const embedDelete = <AuxdibotSubcommand>{
   name: 'delete',
   group: 'storage',
   info: {
      module: Modules['Messages'],
      usageExample: '/embed storage delete (id)',
      description: 'Delete a stored embed from the server.',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const id = interaction.options.getString('id', true);
      const server = interaction.data.guildData;
      if (!server.stored_embeds.find((embed) => embed.id === id)) {
         return handleError(auxdibot, 'EMBED_NOT_FOUND', 'Embed not found!', interaction);
      }
      await interaction.deferReply();
      return deleteStoredEmbed(auxdibot, interaction.guild, id)
         .then(() => {
            const embed = new EmbedBuilder()
               .setColor(auxdibot.colors.accept)
               .setTitle('Embed Deleted')
               .setDescription(`Embed \`${id}\` has been deleted.`);
            return auxdibot.createReply(interaction, {
               embeds: [embed],
               ephemeral: true,
            });
         })
         .catch(() => {
            return handleError(auxdibot, 'EMBED_DELETE_ERROR', 'There was an error deleting the embed!', interaction);
         });
   },
};
