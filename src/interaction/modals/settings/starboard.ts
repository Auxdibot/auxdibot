import { EmbedBuilder, ModalSubmitInteraction, PermissionFlagsBits } from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import AuxdibotModal from '@/interfaces/modals/AuxdibotModal';
import handleError from '@/util/handleError';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import createStarboard from '@/modules/features/starboard/boards/createStarboard';
import { defaultStarLevels } from '@/constants/database/defaultStarLevels';
import toggleModule from '@/modules/features/settings/toggleModule';

export default <AuxdibotModal>{
   module: Modules['Settings'],
   name: 'starboard',
   command: 'setup starboard',
   async execute(auxdibot: Auxdibot, interaction: ModalSubmitInteraction) {
      if (!interaction.guildId) return;
      const server = await findOrCreateServer(auxdibot, interaction.guildId);
      const starboardName = interaction.fields.getTextInputValue('starboard_name'),
         starboardChannel = interaction.fields.getTextInputValue('starboard_channel'),
         starboardReaction = interaction.fields.getTextInputValue('starboard_reaction'),
         starboardCount = interaction.fields.getTextInputValue('starboard_count');
      await interaction.deferReply();
      try {
         const channel = await interaction.guild.channels
            .create({
               name: starboardChannel,
               permissionOverwrites: [
                  {
                     id: interaction.guild.roles.everyone.id,
                     deny: [PermissionFlagsBits.SendMessages],
                  },
                  {
                     id: auxdibot.user.id,
                     allow: [PermissionFlagsBits.SendMessages],
                  },
               ],
            })
            .catch(() => null);
         if (server.disabled_modules.includes('Starboard'))
            await toggleModule(auxdibot, interaction.guild, 'Starboard', true);
         await createStarboard(auxdibot, interaction.guild, interaction.user, {
            board_name: starboardName,
            star_levels: starboardReaction == '⭐' ? defaultStarLevels : [],
            channelID: channel?.id,
            count: Number(starboardCount),
            reaction: starboardReaction,
         });
         const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
         embed.author = { name: interaction.user.username, icon_url: interaction.user.avatarURL({ size: 128 }) };
         embed.title = '🔨 Setup Summary';
         embed.description = `\nStarboard: ${
            starboardChannel ? `✅ \`starboard\` ${channel}` : '❌'
         }\n*(A message must obtain ${starboardCount} ${starboardReaction} reactions in order to appear on the starboard)*\n\nStarboard has been configured. You can add another starboard by running the command \`/starboard board create\` or change the starboard settings by running the commands \`/starboard settings self_star\` and \`/starboard settings starboard_star\`.`;
         return await auxdibot.createReply(interaction, { embeds: [embed] });
      } catch (x) {
         console.error(x);
         handleError(
            auxdibot,
            'STARBOARD_SETUP_FAILURE',
            `The starboard setup failed! This may be possible due to several reasons\n\n* The name you provided was not an alphanumeric sequence.\n* A starboard already exists with the name "${starboardName}"\n* The reaction you provided was invalid.\n* The reaction count you provided was invalid.\n* Something went wrong when creating a channel\n* An error occurred because of Auxdibot not having permission\n`,
            interaction,
         );
      }
   },
};
