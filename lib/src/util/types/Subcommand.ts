import CommandInfo from "./CommandInfo";
import {ChatInputCommandInteraction} from "discord.js";

export interface Subcommand {
    name: string;
    info: CommandInfo;
    execute(interaction: ChatInputCommandInteraction): any;

}