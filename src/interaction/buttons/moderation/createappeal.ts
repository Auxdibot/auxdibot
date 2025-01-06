import Modules from '@/constants/bot/commands/Modules';
import AuxdibotButton from '@/interfaces/buttons/AuxdibotButton';
import { getServerPunishments } from '@/modules/features/moderation/getServerPunishments';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import handleError from '@/util/handleError';
import { ActionRowBuilder, ModalBuilder, TextInputBuilder } from '@discordjs/builders';
import { Guild, ModalActionRowComponentBuilder } from 'discord.js';

export default <AuxdibotButton>{
   name: 'createappeal',
   command: 'appeal',
   module: Modules['Moderation'],
   allowedDefault: true,
   async execute(auxdibot, interaction) {
      const [, appeal_id] = interaction.customId.split('-');
      const [serverID, punishment_id] = appeal_id;
      const punishment = await getServerPunishments(auxdibot, serverID, {
         punishmentID: Number(punishment_id),
         userID: interaction.user.id,
         expired: false,
      });
      if (punishment.length == 0) {
         return handleError(auxdibot, 'PUNISHMENT_NOT_FOUND', 'I could not find that punishment!', interaction);
      }
      const [punishmentData] = punishment;
      if (punishmentData.appeal) {
         return handleError(auxdibot, 'ALREADY_APPEALED', 'This punishment has already been appealed!', interaction);
      }

      const server = await findOrCreateServer(auxdibot, serverID),
         guild: Guild | undefined = await auxdibot.guilds.fetch(serverID).catch(() => undefined);

      if (!guild || !server) {
         return handleError(auxdibot, 'GUILD_NOT_FOUND', 'I could not find that server!', interaction);
      }
      const hasPremium = await auxdibot.fetchPremiumSubscriptionUser(serverID).catch(() => false);
      if (!server.appeal_channel || !hasPremium) {
         return handleError(auxdibot, 'APPEALS_NOT_SET', 'Appeals have not been setup for this server!', interaction);
      }
      const modal = new ModalBuilder()
         .setTitle('Appeal Punishment')
         .setCustomId(`createappeal-${appeal_id}`)
         .addComponents(
            new ActionRowBuilder<ModalActionRowComponentBuilder>().setComponents(
               new TextInputBuilder()
                  .setCustomId('reason')
                  .setPlaceholder('The reason given for the appeal.')
                  .setLabel('What is the appeal reason?')
                  .setMaxLength(1000),
            ),
         );
      return await interaction.showModal(modal);
   },
};
