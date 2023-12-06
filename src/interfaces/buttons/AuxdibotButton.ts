import { MessageComponentInteraction } from 'discord.js';
import AuxdibotFeatureModule from '../commands/AuxdibotFeatureModule';
import { Auxdibot } from '../Auxdibot';

export default interface AuxdibotButton {
   module: AuxdibotFeatureModule;
   name: string;
   permission: string | undefined;
   execute(auxdibot: Auxdibot, interaction: MessageComponentInteraction): void;
   allowedDefault?: boolean;
}
