import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import createPunishment from '@/modules/features/moderation/createPunishment';
import incrementPunishmentsTotal from '@/modules/features/moderation/incrementPunishmentsTotal';
import canExecute from '@/util/canExecute';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';
import { Punishment, PunishmentType } from '@prisma/client';
import { PermissionFlagsBits } from 'discord.js';

export const punishWarn = <AuxdibotSubcommand>{
   name: 'warn',
   info: {
      module: Modules['Moderation'],
      description:
         'Warns a user, giving them a DM warning (if they have DMs enabled) and adding a warn to their record on the server.',
      usageExample: '/punish warn (user) [reason]',
      permissionsRequired: [PermissionFlagsBits.ModerateMembers],
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const user = interaction.options.getUser('user', true),
         reason = interaction.options.getString('reason') || 'No reason specified.';
      const member = interaction.data.guild.members.resolve(user.id);
      if (!member)
         return await handleError(auxdibot, 'MEMBER_NOT_IN_SERVER', 'This user is not in the server!', interaction);

      if (!canExecute(interaction.data.guild, interaction.data.member, member)) {
         const noPermissionEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
         noPermissionEmbed.title = '⛔ No Permission!';
         noPermissionEmbed.description = `This user has a higher role than you or owns this server!`;
         return await auxdibot.createReply(interaction, { embeds: [noPermissionEmbed] });
      }
      const warnData = <Punishment>{
         moderatorID: interaction.user.id,
         userID: user.id,
         reason,
         date_unix: Date.now(),
         dmed: false,
         expires_date_unix: undefined,
         expired: true,
         type: PunishmentType.WARN,
         punishmentID: await incrementPunishmentsTotal(auxdibot, interaction.data.guild.id),
      };

      await createPunishment(auxdibot, interaction.data.guild, warnData, interaction, member.user).catch(async (x) => {
         await handleError(
            auxdibot,
            'PUNISHMENT_CREATION_ERROR',
            x.message ?? 'An unknown error occurred while creating the punishment!',
            interaction,
         );
      });
   },
};
