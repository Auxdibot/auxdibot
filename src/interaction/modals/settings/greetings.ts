import { EmbedBuilder, ModalSubmitInteraction } from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import AuxdibotModal from '@/interfaces/modals/AuxdibotModal';
import handleError from '@/util/handleError';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import toggleModule from '@/modules/features/settings/toggleModule';
import setJoinLeaveChannel from '@/modules/features/greetings/setJoinLeaveChannel';

export default <AuxdibotModal>{
   module: Modules['Settings'],
   name: 'greetings',
   command: 'setup greetings',
   async execute(auxdibot: Auxdibot, interaction: ModalSubmitInteraction) {
      if (!interaction.guildId) return;
      const server = await findOrCreateServer(auxdibot, interaction.guildId);
      const greetingsChannel = interaction.fields.getTextInputValue('greetings_channel');
      await interaction.deferReply();
      try {
         let channel = undefined;
         if (server.disabled_modules.includes('Greetings'))
            await toggleModule(auxdibot, interaction.guild, 'Greetings', true);
         channel = await interaction.guild.channels
            .create({
               name: greetingsChannel,
               permissionOverwrites: [
                  {
                     id: interaction.guild.roles.everyone.id,
                     deny: ['SendMessages'],
                  },
               ],
            })
            .catch(() => null);

         const channelResult = await setJoinLeaveChannel(auxdibot, interaction.guild, interaction.user, channel).catch(
            () => null,
         );

         const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
         embed.author = { name: interaction.user.username, icon_url: interaction.user.avatarURL({ size: 128 }) };
         embed.title = '🔨 Setup Summary';
         embed.description = `\nGreetings Channel: ${channel && channelResult ? channel : '❌'}\n\n
            Greetings have been configured. Administrators can update the Join/Leave/Join DM messages for this server by running the \`/(join|join_dm|leave) message\` commands.`;
         return await auxdibot.createReply(interaction, { embeds: [embed] });
      } catch (x) {
         console.error(x);
         handleError(
            auxdibot,
            'GREETINGS_SETUP_FAILURE',
            `The greetings setup failed! This may be possible due to several reasons\n\n* Something went wrong when creating a channel.\n* An error occurred because of Auxdibot not having permission.\n`,
            interaction,
         );
      }
   },
};
