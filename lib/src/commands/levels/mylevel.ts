import {
    ActionRowBuilder, ButtonBuilder, ButtonStyle,
    SlashCommandBuilder
} from "discord.js";
import AuxdibotCommand from "../../util/templates/AuxdibotCommand";
import Embeds from '../../util/constants/Embeds';
import {
    IAuxdibot
} from "../../util/templates/IAuxdibot";
import HelpCommandInfo from "../../util/types/HelpCommandInfo";
import dotenv from "dotenv";
import AuxdibotCommandInteraction from "../../util/templates/AuxdibotCommandInteraction";
import BaseAuxdibotCommandData from "../../util/types/commandData/BaseAuxdibotCommandData";
import GuildAuxdibotCommandData from "../../util/types/commandData/GuildAuxdibotCommandData";
dotenv.config();
const helpCommand = < AuxdibotCommand > {
    data: new SlashCommandBuilder()
        .setName('mylevel')
        .setDescription('View your level on this server.'),
    info: {
        help: {
            commandCategory: "Levels",
            name: "/mylevel",
            description: "View your level on this server.",
            usageExample: "/mylevel"
        },
        allowedDefault: true,
        permission: "levels.mylevel"
    },
    async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
        if (!interaction.data) return;

    }
}
module.exports = helpCommand;