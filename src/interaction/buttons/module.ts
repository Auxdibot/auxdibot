import AuxdibotButton from '@/interfaces/buttons/AuxdibotButton';
import { MessageComponentInteraction } from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { HelpEmbeds } from '@/constants/bot/commands/HelpEmbeds';

export default <AuxdibotButton>{
   module: Modules['General'],
   name: 'module',
   permission: 'commands.help.all',
   command: 'help all',
   allowedDefault: true,
   async execute(auxdibot: Auxdibot, interaction: MessageComponentInteraction) {
      const [, module] = interaction.customId.split('-');
      interaction.message
         .edit({
            embeds: [HelpEmbeds[module](auxdibot)],
         })
         .catch(() => undefined);
      return interaction
         .deferReply()
         .then(() => interaction.deleteReply())
         .catch(() => undefined);
   },
};
