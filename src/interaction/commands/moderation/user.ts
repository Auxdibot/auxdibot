import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { createUserEmbed } from '@/modules/features/moderation/createUserEmbed';

export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('user')
      .setDescription("View and edit a user's data.")
      .addUserOption((builder) => builder.setName('user').setDescription('The user to view.')),
   info: {
      module: Modules['Moderation'],
      description:
         "Displays an easy to use embed where you can view and edit a user's data, including punishments on their record.",
      usageExample: '/user [user]',
      permissionsRequired: [PermissionFlagsBits.ModerateMembers],
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data || !interaction.channel) return;
      const user = interaction.options.getUser('user');
      return await auxdibot.createReply(
         interaction,
         await createUserEmbed(auxdibot, interaction.guild, user?.id ?? interaction.user.id),
      );
   },
};
