import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import resetAllXP from '@/modules/features/levels/resetAllXP';
import { EmbedBuilder } from '@discordjs/builders';

export const resetAllLevels = <AuxdibotSubcommand>{
   name: 'reset_all',
   group: 'xp',
   info: {
      module: Modules['Levels'],
      description: "Reset every member's level and XP. (WARNING: THIS CANNOT BE RECOVERED)",
      usageExample: '/levels xp reset_all',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;

      resetAllXP(auxdibot, interaction.data.guildData.serverID);
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.description = `Successfully reset the entire server's level & XP`;
      embed.title = 'Success!';
      return await auxdibot.createReply(interaction, { embeds: [embed] });
   },
};
