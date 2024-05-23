import Modules from '@/constants/bot/commands/Modules';
import { defaultStarLevels } from '@/constants/database/defaultStarLevels';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import createStarboard from '@/modules/features/starboard/boards/createStarboard';
import handleError from '@/util/handleError';
import { EmbedBuilder } from 'discord.js';

export const setupStarboard = <AuxdibotSubcommand>{
   name: 'starboard',
   info: {
      module: Modules['Settings'],
      description: 'Auxdibot will be automatically configure a starboard for your server.',
      usageExample: '/setup starboard',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const server = interaction.data.guildData;

      await interaction.deferReply();

      try {
         let starboardChannel = undefined;
         if (!server.disabled_modules.includes('Starboard')) {
            starboardChannel = await interaction.guild.channels
               .create({
                  name: 'starboard',
               })
               .catch(() => undefined);
         }
         await createStarboard(auxdibot, interaction.guild, interaction.user, {
            board_name: 'starboard',
            star_levels: defaultStarLevels,
            channelID: starboardChannel?.id,
            count: 5,
            reaction: '⭐',
         });
         const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
         embed.author = { name: interaction.user.username, icon_url: interaction.user.avatarURL({ size: 128 }) };
         embed.title = '🔨 Setup Summary';
         embed.description = `\nStarboard: ${
            starboardChannel ? `✅ \`starboard\` ${starboardChannel}` : '❌'
         }\n*(A message must obtain 5 ⭐ reactions in order to appear on the starboard)*\n\nStarboard has been configured. You can add another starboard by running the command \`/starboard board create\` or change the starboard settings by running the commands \`/starboard settings self_star\` and \`/starboard settings starboard_star\`.`;
         return await interaction.editReply({ embeds: [embed] });
      } catch (x) {
         handleError(
            auxdibot,
            'STARBOARD_SETUP_FAILURE',
            'The starboard setup failed! This may be possible due to several reasons\n\n* A channel with the name of a channel Auxdibot tried to create already exists\n* A starboard already exists with the name "starboard"\n* Something went wrong when creating a channel\n* An error occurred because of Auxdibot not having permission\n',
            interaction,
         );
      }
   },
};
