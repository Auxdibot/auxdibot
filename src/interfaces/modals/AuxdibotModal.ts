import { ModalSubmitInteraction } from 'discord.js';
import AuxdibotFeatureModule from '../commands/AuxdibotFeatureModule';
import { Auxdibot } from '@/Auxdibot';

export default interface AuxdibotModal {
   module: AuxdibotFeatureModule;
   name: string;
   command?: string;
   execute(auxdibot: Auxdibot, interaction: ModalSubmitInteraction): void;
   allowedDefault?: boolean;
}
