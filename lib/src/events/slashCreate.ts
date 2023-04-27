import {
    BaseInteraction,
    GuildMember,
} from "discord.js";
import {
    IAuxdibot
} from "../util/templates/IAuxdibot";
import Embeds from "../util/constants/Embeds";
import Server from "../mongo/model/Server";
import DMAuxdibotCommandData from "../util/types/commandData/DMAuxdibotCommandData";
import AuxdibotCommandInteraction from "../util/templates/AuxdibotCommandInteraction";
import GuildAuxdibotCommandData from "../util/types/commandData/GuildAuxdibotCommandData";

module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction: BaseInteraction) {
        const client: IAuxdibot = interaction.client;
        if (!interaction.isChatInputCommand() || !client.commands) return;
        let command = client.commands.get(interaction.commandName);
        if (!command) return;
        if (interaction.guild && interaction.member) {
            let interactionData: AuxdibotCommandInteraction<GuildAuxdibotCommandData> = interaction;
            let server = await Server.findOrCreateServer(interaction.guild.id);
            interactionData.data = <GuildAuxdibotCommandData>{
                dmCommand: false,
                date: new Date(),
                guild: interaction.guild,
                member: interaction.member as GuildMember,
                guildData: server
            };
            if (command.subcommands) {
                let subcommand = command.subcommands ? command.subcommands.filter((subcommand) => subcommand.name == interaction.options.getSubcommand())[0] : null;
                if (subcommand) {
                    if (!server.testPermission(subcommand.info.permission, interactionData.data.member, (command.info.allowedDefault) || false)) {
                        let noPermissionEmbed = Embeds.DENIED_EMBED.toJSON();
                        noPermissionEmbed.title = "⛔ No Permission!"
                        noPermissionEmbed.description = `You do not have permission to use this subcommand. (Missing permission: \`${subcommand.info.permission}\`)`
                        return await interaction.reply({
                            embeds: [noPermissionEmbed]
                        });
                    }
                    return await subcommand.execute(interactionData);
            }
            }
            if (!server.testPermission(command.info.permission, interactionData.data.member, (command.info.allowedDefault) || false)) {
                let noPermissionEmbed = Embeds.DENIED_EMBED.toJSON();
                noPermissionEmbed.title = "⛔ No Permission!"
                noPermissionEmbed.description = `You do not have permission to use this command. (Missing permission: \`${command.info.permission}\`)`
                return await interaction.reply({
                    embeds: [noPermissionEmbed]
                });
            }
            return await command.execute(interactionData);
        } else {
            let interactionData: AuxdibotCommandInteraction<DMAuxdibotCommandData> = interaction;
            interactionData.data = <DMAuxdibotCommandData>{
                dmCommand: true,
                date: new Date(),
                user: interaction.user,
            };
            let subcommand = command.subcommands ? command.subcommands.filter((subcommand) => subcommand.name == interaction.options.getSubcommand())[0] : null;
            if (subcommand) {
                if (!subcommand.info.dmableCommand) {
                    let discordServerOnlyEmbed = Embeds.DENIED_EMBED.toJSON();
                    discordServerOnlyEmbed.title = "⛔ Nope!"
                    discordServerOnlyEmbed.description = `This command can only be used in Discord Servers!`
                    return await interaction.reply({
                        embeds: [discordServerOnlyEmbed]
                    });
                }
                await subcommand.execute(interactionData);
            }
            if (!command.info.dmableCommand) {
                let discordServerOnlyEmbed = Embeds.DENIED_EMBED.toJSON();
                discordServerOnlyEmbed.title = "⛔ Nope!"
                discordServerOnlyEmbed.description = `This command can only be used in Discord Servers!`
                return await interaction.reply({
                    embeds: [discordServerOnlyEmbed]
                });
            }
            await command.execute(interactionData);
        }

        if (client.commands) {
            let command = client.commands.get(interaction.commandName);
            if (command) {


            }
        }
    }
}