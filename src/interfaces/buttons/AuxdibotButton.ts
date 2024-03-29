import { MessageComponentInteraction } from 'discord.js';
import AuxdibotFeatureModule from '../commands/AuxdibotFeatureModule';
import { Auxdibot } from '../Auxdibot';

export default interface AuxdibotButton {
   module: AuxdibotFeatureModule;
   name: string;
   command?: string;
   execute(auxdibot: Auxdibot, interaction: MessageComponentInteraction): void;
   allowedDefault?: boolean;
}
