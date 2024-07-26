import Modules from '@/constants/bot/commands/Modules';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AttachmentBuilder } from 'discord.js';
export default <AuxdibotSubcommand>{
   name: 'export_csv',
   group: 'data',
   info: {
      module: Modules['Levels'],
      description: 'Export the levels data to a CSV file.',
      usageExample: '/levels data export_csv',
   },
   async execute(auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      await interaction.deferReply();
      const data = await auxdibot.database.servermembers.findMany({
         where: { serverID: interaction.guildId },
         select: {
            userID: true,
            xp: true,
         },
      });
      const csv = data.map((member) => `${member.userID},${member.xp}`);
      csv.unshift('userID,level,xp');
      return await auxdibot.createReply(interaction, {
         content: '✅ Your level data has been processed.',
         files: [new AttachmentBuilder(Buffer.from(csv.join('\n'), 'utf-8'), { name: 'levels_data.csv' })],
      });
   },
};
