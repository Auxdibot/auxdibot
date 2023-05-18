import { SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@util/types/templates/AuxdibotCommand';
import AuxdibotCommandInteraction from '@util/types/templates/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@util/types/AuxdibotCommandData';
import Embeds from '@util/constants/Embeds';
import Modules from '@util/constants/Modules';

const recordCommand = <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('record')
      .setDescription('View a users punishment record.')
      .addUserOption((builder) =>
         builder.setName('user').setDescription('The user whose punishments are being displayed. (Optional)'),
      ),
   info: {
      module: Modules['Moderation'],
      description:
         "Displays a user's punishment record. If no user is specified, the user running the command's punishment record.",
      usageExample: '/record [user]',
      permission: 'moderation.record',
   },
   async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const user = interaction.options.getUser('user') || interaction.user;
      const embed = await interaction.data.guildData.recordAsEmbed(user.id);
      if (!embed) return await interaction.reply({ embeds: [Embeds.ERROR_EMBED.toJSON()] });
      await interaction.reply({ embeds: [embed] });
   },
};
module.exports = recordCommand;
