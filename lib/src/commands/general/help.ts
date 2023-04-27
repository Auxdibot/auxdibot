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
dotenv.config();
const helpCommand = < AuxdibotCommand > {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('View the help for Auxdibot.')
        .addStringOption(builder => builder.setName('command_name')
            .setDescription('The command name you want to learn more about. (Optional)')
            .setRequired(false))
        .addStringOption(builder => builder.setName("subcommand_name")
            .setDescription('The subcommand you want to learn more about. (Optional)')
            .setRequired(false)
        ),
    info: {
        help: {
            commandCategory: "General",
            name: "/help",
            description: "Sends a list of commands or information about a specific command.",
            usageExample: "/help [command_name] [subcommand_name]"
        },
        allowedDefault: true,
        permission: "commands.help",
        dmableCommand: true
    },
    async execute(interaction: AuxdibotCommandInteraction<BaseAuxdibotCommandData>) {
        const client: IAuxdibot = interaction.client;
        if (!client || !client.commands) return;
        const command_name = interaction.options.getString('command_name'),
            subcommand_name = interaction.options.getString('subcommand_name');
        if (!command_name) {
            let fields = client.commands.reduce((accumulator, value) => {
                if (!value.info) return accumulator;
                accumulator.filter(i => i.name == value.info.help.commandCategory).length > 0 ? accumulator.filter(i => i.name == value.info.help.commandCategory)[0].commands.push(value.info.help) : accumulator.push({
                    name: value.info.help.commandCategory,
                    commands: [value.info.help],
                });
                return accumulator;
            }, [] as {
                name: string,
                commands: HelpCommandInfo[],
            }[]).map((i) => {
                let stringBuilder = "";
                for (let item of i.commands) {
                    stringBuilder = stringBuilder + `• **${item.name}** - ${item.description}\n\n`
                }
                return {
                    name: i.name + "\n\n",
                    value: stringBuilder,
                    inline: false
                }
            });

            let commandListEmbed = Embeds.DEFAULT_EMBED.toJSON();
            commandListEmbed.title = "❔ Command List";
            commandListEmbed.fields = fields;
            let promo_row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setStyle(5)
                    .setLabel("Invite")
                    .setEmoji("📩")
                    .setURL(process.env.DISCORD_INVITE_LINK || "https://auxdible.me"),
                new ButtonBuilder()
                    .setStyle(5)
                    .setLabel("Website")
                    .setEmoji("🖥️")
                    .setURL("https://bot.auxdible.me")
            );
            return await interaction.reply({
                embeds: [commandListEmbed],
                components: [promo_row.toJSON()]
            });
        }
        let command = client.commands.get(command_name);
        let subcommand = subcommand_name && command && command.subcommands ? command.subcommands.filter((subcommand) => subcommand.name == subcommand_name)[0] : undefined;
        let info = subcommand ? subcommand.info : command ? command.info : undefined;
        if (!info) {
            let errorEmbed = Embeds.ERROR_EMBED.toJSON();
            errorEmbed.description = "Couldn't find that command or subcommand!";
            return await interaction.reply({
                embeds: [errorEmbed]
            });
        }

        let helpCommandEmbed = Embeds.INFO_EMBED.toJSON();
        helpCommandEmbed.title = `❔ ${info.help.name}`
        helpCommandEmbed.author = {
            name: `Category: ${info.help.commandCategory}`
        };
        helpCommandEmbed.fields = [{
            name: "Command Info",
            value: `${info.help.description}`
        },
            {
                name: "Usage",
                value: `\`${info.help.usageExample}\``
            }
        ];
        helpCommandEmbed.footer = {
            text: `Permission: ${info.permission}`
        }
        return await interaction.reply({
            embeds: [helpCommandEmbed]
        });

    }
}
module.exports = helpCommand;