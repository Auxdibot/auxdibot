import { SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@util/types/templates/AuxdibotCommand';
import Embeds from '@util/constants/Embeds';
import canExecute from '@util/functions/canExecute';
import { IPunishment, toEmbedField } from '@schemas/PunishmentSchema';
import AuxdibotCommandInteraction from '@util/types/templates/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@util/types/AuxdibotCommandData';
import { LogType } from '@util/types/enums/Log';
import Modules from '@util/constants/Modules';

const warnCommand = <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('warn')
      .setDescription('Warn a user using Auxdibot.')
      .addUserOption((builder) => builder.setName('user').setDescription('User that will be warned.').setRequired(true))
      .addStringOption((builder) =>
         builder.setName('reason').setDescription('Reason for warn (Optional)').setRequired(false),
      ),
   info: {
      module: Modules['Moderation'],
      description:
         'Warns a user, giving them a DM warning (if they have DMs enabled) and adding a warn to their record on the server.',
      usageExample: '/warn (user) [reason]',
      permission: 'moderation.warn',
   },
   async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const user = interaction.options.getUser('user', true),
         reason = interaction.options.getString('reason') || 'No reason specified.';
      const counter = await interaction.data.guildData.fetchCounter();
      const member = interaction.data.guild.members.resolve(user.id);
      if (!member) {
         const errorEmbed = Embeds.ERROR_EMBED.toJSON();
         errorEmbed.description = 'This user is not on the server!';
         return await interaction.reply({ embeds: [errorEmbed] });
      }
      if (!canExecute(interaction.data.guild, interaction.data.member, member)) {
         const noPermissionEmbed = Embeds.DENIED_EMBED.toJSON();
         noPermissionEmbed.title = '⛔ No Permission!';
         noPermissionEmbed.description = `This user has a higher role than you or owns this server!`;
         return await interaction.reply({ embeds: [noPermissionEmbed] });
      }
      const warnData = <IPunishment>{
         moderator_id: interaction.user.id,
         user_id: user.id,
         reason,
         date_unix: Date.now(),
         dmed: false,
         expires_date_unix: undefined,
         expired: true,
         type: 'warn',
         punishment_id: counter.incrementPunishmentID(),
      };
      const dmEmbed = Embeds.PUNISHED_EMBED.toJSON();
      dmEmbed.title = '⚠ Warn';
      dmEmbed.description = `You were warned on ${interaction.data.guild ? interaction.data.guild.name : 'Server'}.`;
      dmEmbed.fields = [toEmbedField(warnData)];
      warnData.dmed = await user
         .send({ embeds: [dmEmbed] })
         .then(() => true)
         .catch(() => false);

      interaction.data.guildData.punish(warnData).then(async (embed) => {
         if (!embed || !interaction.data) return;

         await interaction.data.guildData.log(
            interaction.data.guild,
            {
               user_id: interaction.user.id,
               description: 'A user was warned.',
               date_unix: Date.now(),
               type: LogType.WARN,
               punishment: warnData,
            },
            true,
         );
         return await interaction.reply({ embeds: [embed] });
      });
   },
};
module.exports = warnCommand;
