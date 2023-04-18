import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import Command from "../../util/templates/Command";
import Server from "../../mongo/model/Server";


const recordCommand = <Command>{
    data: new SlashCommandBuilder()
        .setName('record')
        .setDescription('View a users punishment record.')
        .addUserOption(builder => builder.setName('user')
            .setDescription('The user whose punishments are being displayed. (Optional)')),
    info: {
        help: {
            commandCategory: "Moderation",
            name: "/record",
            description: "Displays a user's punishment record. If no user is specified, the user running the command's punishment record.",
            usageExample: "/record [user]"
        },
        permission: "moderation.record"
    },
    async execute(interaction: ChatInputCommandInteraction ) {
        if (!interaction.guild) return;
        const user = interaction.options.getUser('user') || interaction.user;
        let server = await Server.findOrCreateServer(interaction.guild.id);
        let embed = await server.recordAsEmbed(user.id);
        await interaction.reply({ embeds: [embed] });
    },

}
module.exports = recordCommand;