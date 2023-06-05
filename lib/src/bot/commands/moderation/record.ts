import { SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import userRecordAsEmbed from '@/modules/features/moderation/userRecordAsEmbed';
import handleError from '@/util/handleError';

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
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const user = interaction.options.getUser('user') || interaction.user;
      const embed = await userRecordAsEmbed(auxdibot, interaction.data.guild.id, user.id);
      if (!embed)
         return await handleError(
            auxdibot,
            'FAILED_RECORD_EMBED',
            "Couldn't generate the record embed for that user!",
            interaction,
         );

      await interaction.reply({ embeds: [embed] });
   },
};
module.exports = recordCommand;
