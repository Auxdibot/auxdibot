import { Auxdibot } from './../../../interfaces/Auxdibot';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { EmbedBuilder, GuildBasedChannel, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import Modules from '@/constants/bot/commands/Modules';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import handleError from '@/util/handleError';
export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('report')
      .setDescription('Create a detailed report that will be sent to the moderators of the server.')
      .addStringOption((builder) =>
         builder
            .setName('message')
            .setDescription('The message that will be sent to the moderators of this server.')
            .setRequired(true),
      )
      .addUserOption((builder) => builder.setName('user').setDescription('The user that you are reporting.')),
   info: {
      module: Modules['Moderation'],
      description: 'Create a detailed report that will be sent to the moderators of the server.',
      usageExample: '/report (message) [user]',
      permission: 'report',
      allowedDefault: true,
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      const message = interaction.options.getString('message', true),
         user = interaction.options.getUser('user');
      const server = interaction.data.guildData,
         channel: GuildBasedChannel | undefined = await interaction.guild.channels.cache.find(
            (i) => i.id == server.reports_channel,
         );
      if (!channel) {
         return handleError(
            auxdibot,
            'NO_REPORT_CHANNEL',
            'There is no reports channel on this server! Ask an administrator to setup a reports channel with `/moderation settings reports_channel`',
            interaction,
            true,
         );
      }
      if (!channel.isTextBased() || channel.isVoiceBased() || channel.isThread()) {
         return handleError(
            auxdibot,
            'INVALID_REPORT_CHANNEL',
            'The reports channel on this server is not valid! Ask an administrator to setup a reports channel with `/moderation settings reports_channel`',
            interaction,
            true,
         );
      }
      const report = new EmbedBuilder().setColor(auxdibot.colors.punishment).toJSON();
      report.title = '📩 New Report';
      report.thumbnail = { url: interaction.user.avatarURL({ size: 256 }) };
      report.description = `🧍 User: ${interaction.user}${user ? `\n⛓️ Reported User: ${user}` : ''}`;
      report.fields = [
         {
            name: 'Report Content',
            value: `\`\`\`${message}\`\`\``,
         },
      ];
      return channel
         .send({ embeds: [report], content: server.report_role ? `<@&${server.report_role}>` : '' })
         .then(async () => {
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = '📩 Report Submitted';
            embed.description = `Your report has been submitted to the moderators of ${interaction.guild.name}.`;
            return await interaction.reply({
               embeds: [embed],
               ephemeral: true,
            });
         })
         .catch(() => {
            handleError(
               auxdibot,
               'FAILED_REPORT',
               'An error occurred while trying to submit your report! Try again later.',
               interaction,
               true,
            );
         });
   },
};
