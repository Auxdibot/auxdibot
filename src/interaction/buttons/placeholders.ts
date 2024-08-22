import AuxdibotButton from '@/interfaces/buttons/AuxdibotButton';
import { MessageComponentInteraction } from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { createPlaceholderList } from '@/modules/features/embeds/createPlaceholderList';

export default <AuxdibotButton>{
   module: Modules['Messages'],
   name: 'placeholders',
   command: 'help placeholders',
   async execute(auxdibot: Auxdibot, interaction: MessageComponentInteraction) {
      return await auxdibot.createReply(interaction, {
         embeds: [createPlaceholderList(auxdibot)],
         ephemeral: true,
      });
   },
};
