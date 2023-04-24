import {
    SlashCommandBuilder
} from "discord.js";
import Command from "../../util/templates/Command";
import Embeds from '../../util/constants/Embeds';
import dotenv from "dotenv";
import Placeholders from "../../util/types/Placeholders";
dotenv.config();
const placeholderCommand = < Command > {
    data: new SlashCommandBuilder()
        .setName('placeholders')
        .setDescription('View a list of placeholders and what they do.'),
    info: {
        help: {
            commandCategory: "General",
            name: "/placeholders",
            description: "View a list of placeholders and what they do.",
            usageExample: "/placeholders"
        },
        permission: "commands.placeholders"
    },
    async execute(interaction) {
        let placeholdersEmbed = Embeds.DEFAULT_EMBED.toJSON();
        placeholdersEmbed.title = "🔁 Placeholders";
        placeholdersEmbed.description = "Placeholders can be used in **ANY** Auxdibot command that sends a message! Try out /embed /join or /leave!"
        placeholdersEmbed.fields = [{
            name: "Server",
            value: Object.keys(Placeholders).filter((key) => /^server_/.test(key)).reduce((accumulator, key) =>  `${accumulator}\r\n\`%${key}%\``, "")
        }, {
            name: "Member",
            value: Object.keys(Placeholders).filter((key) => /^member_/.test(key)).reduce((accumulator, key) =>  `${accumulator}\r\n\`%${key}%\``, "")
        }, {
            name: "Message",
            value: Object.keys(Placeholders).filter((key) => /^message_/.test(key)).reduce((accumulator, key) =>  `${accumulator}\r\n\`%${key}%\``, "")
        }]
        return await interaction.reply({
            embeds: [placeholdersEmbed]
        });

    }
}
module.exports = placeholderCommand;