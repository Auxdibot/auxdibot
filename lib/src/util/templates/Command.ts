import {ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder} from "discord.js";

import CommandInfo from "../types/CommandInfo";
import {Subcommand} from "../types/Subcommand";

interface Command {
    data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">;
    execute(interaction: ChatInputCommandInteraction): any;
    info: CommandInfo;
    subcommands?: Subcommand[];
}


export default Command;