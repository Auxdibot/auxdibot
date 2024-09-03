import { EmbedBuilder, ModalSubmitInteraction } from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import AuxdibotModal from '@/interfaces/modals/AuxdibotModal';
import handleError from '@/util/handleError';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import toggleModule from '@/modules/features/settings/toggleModule';
import setMessageXP from '@/modules/features/levels/setMessageXP';
import setVoiceXP from '@/modules/features/levels/setVoiceXP';
import setEventXP from '@/modules/features/levels/setEventXP';
import setStarboardXP from '@/modules/features/levels/setStarboardXP';
import setLevelChannel from '@/modules/features/levels/setLevelChannel';

export default <AuxdibotModal>{
   module: Modules['Settings'],
   name: 'levels',
   command: 'setup levels',
   async execute(auxdibot: Auxdibot, interaction: ModalSubmitInteraction) {
      if (!interaction.guildId) return;
      const server = await findOrCreateServer(auxdibot, interaction.guildId);
      const messageXP = interaction.fields.getTextInputValue('levels_message'),
         voiceXP = interaction.fields.getTextInputValue('levels_voice'),
         starboardXP = interaction.fields.getTextInputValue('levels_starboard'),
         eventXP = interaction.fields.getTextInputValue('levels_event'),
         levelChannel = interaction.fields.getTextInputValue('levels_channel');
      await interaction.deferReply();
      try {
         let channel = undefined;
         if (server.disabled_modules.includes('Levels'))
            await toggleModule(auxdibot, interaction.guild, 'Levels', true);
         channel = await interaction.guild.channels
            .create({
               name: levelChannel,
            })
            .catch(() => null);
         const messageResult = await setMessageXP(
            auxdibot,
            interaction.guild,
            messageXP.split('-').map((i) => Number(i)),
         ).catch(() => null);
         const voiceResult = await setVoiceXP(
            auxdibot,
            interaction.guild,
            voiceXP.split('-').map((i) => Number(i)),
         ).catch(() => null);
         const eventResult = await setEventXP(
            auxdibot,
            interaction.guild,
            eventXP.split('-').map((i) => Number(i)),
         ).catch(() => null);
         const starboardResult = await setStarboardXP(
            auxdibot,
            interaction.guild,
            starboardXP.split('-').map((i) => Number(i)),
         ).catch(() => null);
         const channelResult = await setLevelChannel(auxdibot, interaction.guild, interaction.user, channel).catch(
            () => null,
         );
         const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
         embed.author = { name: interaction.user.username, icon_url: interaction.user.avatarURL({ size: 128 }) };
         embed.title = '🔨 Setup Summary';
         embed.description = `\nMessage XP: ${
            messageResult ? `✅ \`${messageResult.message_xp_range?.join(' to ')} XP\` per message` : '❌'
         }\nEvent XP: ${
            eventResult ? `✅ \`${eventResult.event_xp_range?.join(' to ')} XP\` per event` : '❌'
         }\nMessage XP: ${
            voiceResult ? `✅ \`${voiceResult.voice_xp_range?.join(' to ')} XP\` per minute in VC` : '❌'
         }\nStarboard XP: ${
            starboardResult
               ? `✅ \`${starboardResult.starboard_xp_range?.join(' to ')} XP\` per message on starboard`
               : '❌'
         }\n\nLevel Channel: ${
            channel && channelResult ? channel : '*Auxdibot will reply to the message that caused the user to levelup.*'
         }\n
            Levels have been configured. You can add Level Rewards using the \`/levels rewards\` commmands, or add multipliers for roles/channels by using the \`/levels multipliers\` commands. You can export your level data at any time by running the \`/levels data export_csv\` command.`;
         return await auxdibot.createReply(interaction, { embeds: [embed] });
      } catch (x) {
         handleError(
            auxdibot,
            'LEVELS_SETUP_FAILURE',
            `The levels setup failed! This may be possible due to several reasons\n\n* The XP range provided for any XP range value was invalid.\n* Something went wrong when creating a channel.\n* An error occurred because of Auxdibot not having permission.\n`,
            interaction,
         );
      }
   },
};
