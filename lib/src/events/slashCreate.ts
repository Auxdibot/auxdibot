import {
    BaseInteraction,
    GuildMember,
} from "discord.js";
import {
    IAuxdibot
} from "../util/templates/IAuxdibot";
import Embeds from "../util/constants/Embeds";
import Server from "../mongo/model/Server";

module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction: BaseInteraction) {
        if (!interaction.isChatInputCommand() || !interaction.guild || !interaction.member) return;
        const client: IAuxdibot = interaction.client;
        let server = await Server.findOrCreateServer(interaction.guild.id);
        if (client.commands) {
            let command = client.commands.get(interaction.commandName);
            if (command) {
                if (!command.subcommands) {
                    if (!server.testPermission(command.info.permission, interaction.member as GuildMember, (command.info.allowedDefault) || false)) {
                        let noPermissionEmbed = Embeds.DENIED_EMBED.toJSON();
                        noPermissionEmbed.title = "⛔ No Permission!"
                        noPermissionEmbed.description = `You do not have permission to use this command. (Missing permission: \`${command.info.permission}\`)`
                        return await interaction.reply({
                            embeds: [noPermissionEmbed]
                        });
                    }
                    await command.execute(interaction);

                } else {
                    let subcommand = command.subcommands ? command.subcommands.filter((subcommand) => subcommand.name == interaction.options.getSubcommand())[0] : null;
                    if (subcommand) {
                        if (!server.testPermission(subcommand.info.permission, interaction.member as GuildMember, (command.info.allowedDefault) || false)) {
                            let noPermissionEmbed = Embeds.DENIED_EMBED.toJSON();
                            noPermissionEmbed.title = "⛔ No Permission!"
                            noPermissionEmbed.description = `You do not have permission to use this command. (Missing permission: \`${subcommand.info.permission}\`)`
                            return await interaction.reply({
                                embeds: [noPermissionEmbed]
                            });
                        }
                        await subcommand.execute(interaction);
                    }
                }

            }
        }
    }
}