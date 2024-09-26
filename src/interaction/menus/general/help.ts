import { AnySelectMenuInteraction } from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { HelpEmbeds } from '@/constants/bot/commands/HelpEmbeds';
import AuxdibotSelectMenu from '@/interfaces/menus/AuxdibotSelectMenu';

export default <AuxdibotSelectMenu>{
   module: Modules['General'],
   name: 'help',
   command: 'help all',
   allowedDefault: true,
   async execute(auxdibot: Auxdibot, interaction: AnySelectMenuInteraction) {
      const module = interaction.values[0];
      if (!(module in HelpEmbeds)) return;
      await interaction.deferReply();
      interaction.message
         .edit({
            embeds: [HelpEmbeds[module](auxdibot)],
         })
         .catch((x) => console.error(x));
      return interaction.message
         .edit({
            embeds: [HelpEmbeds[module](auxdibot)],
         })
         .then(() => interaction.deleteReply())
         .catch(() => {
            return interaction.editReply({ embeds: [HelpEmbeds[module](auxdibot)] }).catch((x) => console.error(x));
         });
   },
};
