import { MessageComponentInteraction} from "discord.js";

export default interface Button {
    name: string;
    permission: string | undefined;
    execute(interaction: MessageComponentInteraction): any;
    allowedDefault?: boolean;
}