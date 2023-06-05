import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import canExecute from '@/util/canExecute';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import incrementPunishmentsTotal from '@/modules/features/moderation/incrementPunishmentsTotal';
import createPunishment from '@/modules/features/moderation/createPunishment';
import { LogAction, Punishment, PunishmentType } from '@prisma/client';
import { punishmentInfoField } from '@/modules/features/moderation/punishmentInfoField';
import handleLog from '@/util/handleLog';
import handleError from '@/util/handleError';

const warnCommand = <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('warn')
      .setDescription('Warn a user using Auxdibot.')
      .addUserOption((builder) => builder.setName('user').setDescription('User that will be warned.').setRequired(true))
      .addStringOption((builder) => builder.setName('reason').setDescription('Reason for warn').setRequired(false)),
   info: {
      module: Modules['Moderation'],
      description:
         'Warns a user, giving them a DM warning (if they have DMs enabled) and adding a warn to their record on the server.',
      usageExample: '/warn (user) [reason]',
      permission: 'moderation.warn',
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

      const dmEmbed = new EmbedBuilder().setColor(auxdibot.colors.punishment).toJSON();
      dmEmbed.title = '⚠ Warn';
      dmEmbed.description = `You were warned on ${interaction.data.guild ? interaction.data.guild.name : 'Server'}.`;
      dmEmbed.fields = [punishmentInfoField(warnData)];
      warnData.dmed = await user
         .send({ embeds: [dmEmbed] })
         .then(() => true)
         .catch(() => false);

      createPunishment(auxdibot, interaction.data.guild.id, warnData, interaction).then(async () => {
         await handleLog(
            auxdibot,
            interaction.data.guild,
            {
               userID: user.id,
               description: `${user.tag} was warned.`,
               date_unix: Date.now(),
               type: LogAction.WARN,
            },
            [punishmentInfoField(warnData)],
            true,
         );
         return;
      });
   },
};
module.exports = warnCommand;
