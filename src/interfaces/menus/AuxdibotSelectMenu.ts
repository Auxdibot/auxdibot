import { AnySelectMenuInteraction } from 'discord.js';
import AuxdibotFeatureModule from '../commands/AuxdibotFeatureModule';
import { Auxdibot } from '../Auxdibot';

export default interface AuxdibotSelectMenu {
   module: AuxdibotFeatureModule;
   name: string;
   /**
    * @deprecated Permissions are now deprecated. Use the command field instead.
    */
   permission?: string;
   command?: string;
   execute(auxdibot: Auxdibot, interaction: AnySelectMenuInteraction): void;
   allowedDefault?: boolean;
}
