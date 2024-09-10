import { AnySelectMenuInteraction } from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import AuxdibotSelectMenu from '@/interfaces/menus/AuxdibotSelectMenu';
import { SettingsEmbeds } from '@/constants/bot/commands/SettingsEmbeds';
import findOrCreateServer from '@/modules/server/findOrCreateServer';

export default <AuxdibotSelectMenu>{
   module: Modules['Settings'],
   name: 'settings',
   command: 'settings view',
   async execute(auxdibot: Auxdibot, interaction: AnySelectMenuInteraction) {
      const module = interaction.values[0];
      const server = await findOrCreateServer(auxdibot, interaction.guild.id);
      if (!(module in SettingsEmbeds)) return;
      interaction.message
         .edit({
            embeds: [SettingsEmbeds[module](auxdibot, server)],
         })
         .catch((x) => console.error(x));
      return interaction
         .deferReply()
         .then(() => interaction.deleteReply())
         .catch((x) => console.error(x));
   },
};
