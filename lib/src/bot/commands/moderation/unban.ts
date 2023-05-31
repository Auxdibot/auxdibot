import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import { toEmbedField } from '@/mongo/schema/PunishmentSchema';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import { LogType } from '@/config/Log';
import Modules from '@/config/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';

const unbanCommand = <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('unban')
      .setDescription('Unban a user.')
      .addUserOption((builder) =>
         builder
            .setName('user')
            .setDescription('The user to be unbanned. Use their Discord user ID.')
            .setRequired(true),
      ),
   info: {
      module: Modules['Moderation'],
      description: 'Unbans a user if they are currently banned. For banned members, use their user ID.',
      usageExample: '/unban (user)',
      permission: 'moderation.ban.remove',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const user = interaction.options.getUser('user', true);
      const data = await interaction.data.guildData.fetchData();
      const banned = data.getPunishment(user.id, 'ban');
      if (!banned) {
         const errorEmbed = auxdibot.embeds.error.toJSON();
         errorEmbed.description = "This user isn't banned!";
         return await interaction.reply({ embeds: [errorEmbed] });
      }
      interaction.data.guild.bans.remove(user.id).catch(() => undefined);
      banned.expired = true;
      await data.save();

      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.title = `📥 Unbanned ${user.tag}`;
      embed.description = `User was unbanned.`;
      embed.fields = [toEmbedField(banned)];
      await interaction.data.guildData.log(
         interaction.data.guild,
         {
            user_id: interaction.user.id,
            description: 'A user was unbanned.',
            date_unix: Date.now(),
            type: LogType.UNBAN,
            punishment: banned,
         },
         true,
      );
      await interaction.reply({ embeds: [embed] });
   },
};
module.exports = unbanCommand;
