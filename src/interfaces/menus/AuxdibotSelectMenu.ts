import { AnySelectMenuInteraction } from 'discord.js';
import AuxdibotFeatureModule from '../commands/AuxdibotFeatureModule';
import { Auxdibot } from '../Auxdibot';

export default interface AuxdibotSelectMenu {
   module: AuxdibotFeatureModule;
   name: string;
   permission: string | undefined;
   execute(auxdibot: Auxdibot, interaction: AnySelectMenuInteraction): void;
   allowedDefault?: boolean;
}
