import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';

import canExecute from '@/util/canExecute';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import Modules from '@/constants/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { LogAction, Punishment, PunishmentType } from '@prisma/client';
import incrementPunishmentsTotal from '@/modules/features/moderation/incrementPunishmentsTotal';
import createPunishment from '@/modules/features/moderation/createPunishment';
import handleLog from '@/util/handleLog';
import { punishmentInfoField } from '@/modules/features/moderation/punishmentInfoField';

const kickCommand = <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('kick')
      .setDescription('Kick a user using Auxdibot.')
      .addUserOption((builder) => builder.setName('user').setDescription('User that will be kicked.').setRequired(true))
      .addStringOption((builder) =>
         builder.setName('reason').setDescription('Reason for kick (Optional)').setRequired(false),
      ),
   info: {
      module: Modules['Moderation'],
      description: 'Kicks a user, removing them from the server and adding a kick to their record on the server.',
      usageExample: '/kick (user) [reason]',
      permission: 'moderation.kick',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const user = interaction.options.getUser('user', true),
         reason = interaction.options.getString('reason') || 'No reason specified.';
      const member = interaction.data.guild.members.resolve(user.id);
      if (!member) {
         const errorEmbed = auxdibot.embeds.error.toJSON();
         errorEmbed.description = 'This user is not on the server!';
         return await interaction.reply({ embeds: [errorEmbed] });
      }
      if (!canExecute(interaction.data.guild, interaction.data.member, member)) {
         const noPermissionEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
         noPermissionEmbed.title = '⛔ No Permission!';
         noPermissionEmbed.description = `This user has a higher role than you or owns this server!`;
         return await interaction.reply({ embeds: [noPermissionEmbed] });
      }
      interaction.data.guild.members
         .kick(user, reason)
         .then(async () => {
            if (!interaction.data) return;
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
            createPunishment(auxdibot, interaction.data.guildData.serverID, kickData, interaction).then(async () => {
               await handleLog(
                  auxdibot,
                  interaction.data.guild,
                  {
                     userID: user.id,
                     description: `${user.tag} was kicked.`,
                     date_unix: Date.now(),
                     type: LogAction.KICK,
                  },
                  [punishmentInfoField(kickData)],
                  true,
               );
               return;
            });
         })
         .catch(async () => {
            const errorEmbed = auxdibot.embeds.error.toJSON();
            errorEmbed.description = "Couldn't kick that user.";
            return await interaction.reply({ embeds: [errorEmbed] });
         });
   },
};
module.exports = kickCommand;
