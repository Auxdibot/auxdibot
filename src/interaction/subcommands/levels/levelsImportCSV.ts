import Modules from '@/constants/bot/commands/Modules';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import axios from 'axios';
import { AttachmentBuilder, GuildMember } from 'discord.js';
import handleError from '@/util/handleError';
export default <AuxdibotSubcommand>{
   name: 'import_csv',
   group: 'data',
   info: {
      module: Modules['Levels'],
      description: 'Import data from a CSV file.',
      usageExample: '/levels data import_csv (csv) [overwrite]',
   },
   async execute(auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const csvAttachment = interaction.options.getAttachment('csv', true);
      const showErrors = interaction.options.getBoolean('show_errors', false);
      await interaction.deferReply();
      if (!csvAttachment.name.endsWith('.csv')) {
         return await handleError(
            auxdibot,
            'IMPORT_CSV_ERROR',
            'The file you provided is not a CSV file. Please provide a valid CSV file.',
            interaction,
         );
      }
      try {
         const csvResponse = await axios.get(csvAttachment.url).then((data) => data.data);
         const csvRows = csvResponse.split('\n');
         const headers = csvRows[0].split(',');
         const csvObjects = [];
         for (let i = 1; i < csvRows.length; i++) {
            const row = csvRows[i].split(',');
            const csvObject = {};

            for (let j = 0; j < headers.length; j++) {
               csvObject[headers[j]] = row[j];
            }

            csvObjects.push(csvObject);
         }
         const updated = [];
         for (const csvObject of csvObjects) {
            const userID = csvObject['userID'];
            const xp = parseInt(csvObject['xp']);
            if (isNaN(xp) && showErrors) {
               return await handleError(
                  auxdibot,
                  'CSV_PARSE_ERROR',
                  `The "xp" field for user with ID ${userID} is not a number.`,
                  interaction,
               );
            }

            if (isNaN(xp)) continue;
            const member: GuildMember | undefined = await interaction.guild.members
               .fetch(userID)
               .catch(() => undefined);
            if (!member) continue;
            await auxdibot.database.servermembers
               .upsert({
                  where: { serverID_userID: { serverID: interaction.guildId, userID } },
                  update: {
                     xp: xp,
                  },
                  create: {
                     serverID: interaction.guildId,
                     userID,
                     xp,
                  },
               })
               .then(() => {
                  updated.push({ name: member.displayName, new: `XP: ${xp}` });
               });
         }
         return auxdibot.createReply(interaction, {
            content: '✅ Your level data has been processed.',
            files: [
               new AttachmentBuilder(Buffer.from(updated.map((i) => `${i.name} => ${i.new}`).join('\n')), {
                  name: 'changelog.txt',
               }),
            ],
         });
      } catch (error) {
         return await handleError(
            auxdibot,
            'IMPORT_CSV_ERROR',
            'There was an error processing your CSV file. (Possibly invalid CSV file, or invalid CSV data.)',
            interaction,
         );
      }
   },
};
