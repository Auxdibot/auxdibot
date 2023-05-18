import { MessageComponentInteraction } from 'discord.js';

export default interface AuxdibotButton {
   name: string;
   permission: string | undefined;
   execute(interaction: MessageComponentInteraction): any;
   allowedDefault?: boolean;
}
