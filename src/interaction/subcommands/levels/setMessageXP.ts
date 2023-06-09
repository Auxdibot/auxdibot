import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { EmbedBuilder } from '@discordjs/builders';

export const setMessageXP = <AuxdibotSubcommand>{
   name: 'message_xp',
   info: {
      module: Modules['Levels'],
      description: 'Set the amount of XP given for sending a message.',
      usageExample: '/levels message_xp (xp)',
      permission: 'levels.message_xp',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const xp = interaction.options.getNumber('xp', true);
      await auxdibot.database.servers.update({
         where: { serverID: interaction.data.guildData.serverID },
         data: { message_xp: Math.round(xp) },
      });
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.description = `Members will now get ${xp.toLocaleString()} XP from chatting.`;
      embed.title = 'Success!';
      return await interaction.reply({ embeds: [embed] });
   },
};
