import {ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder} from "discord.js";

import CommandInfo from "../types/CommandInfo";
import {AuxdibotSubcommand} from "../types/AuxdibotSubcommand";

interface AuxdibotCommand {
    data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">;
    execute(interaction: ChatInputCommandInteraction): any;
    info: CommandInfo;
    subcommands?: AuxdibotSubcommand[];
}




export default AuxdibotCommand;