import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import Command from "../../util/templates/Command";
import Embeds from '../../util/constants/Embeds';
import Server from "../../mongo/model/Server";
import {LogType} from "../../mongo/schema/Log";
import {toEmbedField} from "../../mongo/schema/Punishment";

const unbanCommand = <Command>{
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unban a user.')
        .addUserOption(builder => builder.setName('user')
            .setDescription('The user to be unbanned. Use their Discord user ID.')
            .setRequired(true)),
    info: {
        help: {
            commandCategory: "Moderation",
            name: "/unban",
            description: "Unbans a user if they are currently banned. For banned members, use their user ID.",
            usageExample: "/unban (user)"
        },
        permission: "moderation.ban.remove"
    },
    async execute(interaction: ChatInputCommandInteraction ) {
        if (!interaction.guild) return;
        const user = interaction.options.getUser('user');
        let server = await Server.findOrCreateServer(interaction.guild.id);
        if (!server) return;

        if (!user) return await interaction.reply({ embeds: [Embeds.ERROR_EMBED.toJSON()] });
        let banned = server.getPunishment(user.id, 'ban');
        if (!banned) {
            let errorEmbed = Embeds.ERROR_EMBED.toJSON();
            errorEmbed.description = "This user isn't banned!";
            return await interaction.reply({ embeds: [errorEmbed] });
        }
        interaction.guild.bans.remove(user.id).catch(() => undefined);
        banned.expired = true;
        await server.save();

        let embed = Embeds.SUCCESS_EMBED.toJSON();
        embed.title = `📥 Unbanned ${user.tag}`
        embed.description = `User was unbanned.`
        embed.fields = [toEmbedField(banned)]
        await server.log({
            user_id: interaction.user.id,
            description: "A user was unbanned.",
            date_unix: Date.now(),
            type: LogType.UNBAN,
            punishment: banned
        }, interaction.guild)
        await interaction.reply({ embeds: [embed] });
    },

}
module.exports = unbanCommand;