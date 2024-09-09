import { ContextMenuCommandBuilder, ContextMenuCommandInteraction } from 'discord.js';
import { Auxdibot } from '../Auxdibot';
import CommandInfo from '../commands/CommandInfo';

export interface AuxdibotContextMenu {
   data: ContextMenuCommandBuilder;
   command?: string;
   name: string;
   execute?(auxdibot: Auxdibot, interaction: ContextMenuCommandInteraction): unknown;
   info: CommandInfo;
}
