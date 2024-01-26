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

export const punishKick = <AuxdibotSubcommand>{
   name: 'kick',
   info: {
      module: Modules['Moderation'],
      description: 'Kicks a user, removing them from the server and adding a kick to their record on the server.',
      usageExample: '/punish kick (user) [reason]',
      permission: 'moderation.punish.kick',
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
         return await interaction.reply({ embeds: [noPermissionEmbed] });
      }

      const kickData = <Punishment>{
         type: PunishmentType.KICK,
         reason,
         date_unix: Date.now(),
         dmed: false,
         expired: true,
         expires_date_unix: undefined,
         userID: user.id,
         moderatorID: interaction.user.id,
         punishmentID: await incrementPunishmentsTotal(auxdibot, interaction.data.guildData.serverID),
      };
      await createPunishment(auxdibot, interaction.data.guild, kickData, interaction, member.user).catch(async (x) => {
         await handleError(
            auxdibot,
            'PUNISHMENT_CREATION_ERROR',
            x.message ?? 'An unknown error occurred while creating the punishment!',
            interaction,
         );
      });
   },
};
