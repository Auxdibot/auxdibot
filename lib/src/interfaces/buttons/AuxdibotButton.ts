import { MessageComponentInteraction } from 'discord.js';
import AuxdibotFeatureModule from '../commands/AuxdibotFeatureModule';

export default interface AuxdibotButton {
   module: AuxdibotFeatureModule;
   name: string;
   permission: string | undefined;
   execute(interaction: MessageComponentInteraction): any;
   allowedDefault?: boolean;
}
