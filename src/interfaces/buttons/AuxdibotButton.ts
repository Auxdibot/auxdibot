import { MessageComponentInteraction } from 'discord.js';
import AuxdibotFeatureModule from '../commands/AuxdibotFeatureModule';
import { Auxdibot } from '../Auxdibot';

export default interface AuxdibotButton {
   module: AuxdibotFeatureModule;
   name: string;
   /**
    * @deprecated Permissions are now deprecated. Use the command field instead.
    */
   permission?: string;
   command?: string;
   execute(auxdibot: Auxdibot, interaction: MessageComponentInteraction): void;
   allowedDefault?: boolean;
}
