import CommandInfo from "./CommandInfo";
import {ChatInputCommandInteraction} from "discord.js";

export interface AuxdibotSubcommand {
    name: string;
    info: CommandInfo;
    execute(interaction: ChatInputCommandInteraction): any;

}