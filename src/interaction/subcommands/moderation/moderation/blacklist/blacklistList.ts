import { Auxdibot } from '../../../../../interfaces/Auxdibot';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import Modules from '@/constants/bot/commands/Modules';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import { EmbedBuilder } from 'discord.js';
import { PunishmentValues } from '@/constants/bot/punishments/PunishmentValues';

export const blacklistList = <AuxdibotSubcommand>{
   name: 'list',
   group: 'blacklist',
   info: {
      module: Modules['Moderation'],
      description: 'See a list of every blacklisted word on this server.',
      usageExample: '/moderation blacklist list',
      permission: 'moderation.blacklist.list',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.info).toJSON();
      const server = interaction.data.guildData;
      successEmbed.title = '🚫 Blacklisted Phrases';
      successEmbed.description = server.automod_banned_phrases.reduce(
         (accumulator: string, value, index) => `${accumulator}\r\n**${index + 1})** \`${value}\``,
         `Blacklist Violation Punishment: \`${
            PunishmentValues[server.automod_banned_phrases_punishment]?.name || 'None'
         }\``,
      );
      return await interaction.reply({ embeds: [successEmbed] });
   },
};
