import AuxdibotButton from '@/interfaces/buttons/AuxdibotButton';
import { MessageComponentInteraction } from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { SettingsEmbeds } from '@/constants/bot/commands/SettingsEmbeds';
import findOrCreateServer from '@/modules/server/findOrCreateServer';

export default <AuxdibotButton>{
   module: Modules['Settings'],
   name: 'settings',
   command: 'settings view',
   async execute(auxdibot: Auxdibot, interaction: MessageComponentInteraction) {
      const [, settings] = interaction.customId.split('-');
      if (!(settings in SettingsEmbeds)) return;
      const server = await findOrCreateServer(auxdibot, interaction.guildId);
      const card =
         settings == 'general'
            ? auxdibot.database.servercards.findFirst({ where: { serverID: server.serverID } })
            : undefined;
      interaction.message
         .edit({
            embeds: [SettingsEmbeds[settings](auxdibot, server, card)],
         })
         .catch(() => undefined);
      return interaction
         .deferReply()
         .then(() => interaction.deleteReply())
         .catch(() => undefined);
   },
};
