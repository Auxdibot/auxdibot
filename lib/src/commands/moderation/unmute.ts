import {
    ChatInputCommandInteraction,
    GuildMember,
    SlashCommandBuilder
} from "discord.js";
import AuxdibotCommand from "../../util/templates/AuxdibotCommand";
import Embeds from '../../util/constants/Embeds';
import Server from "../../mongo/model/Server";
import canExecute from "../../util/functions/canExecute";
import {LogType} from "../../mongo/schema/Log";
import {toEmbedField} from "../../mongo/schema/Punishment";

const unmuteCommand = <AuxdibotCommand>{
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Unmute a user.')
        .addUserOption(builder => builder.setName('user')
            .setDescription('The user to be unmuted.')
            .setRequired(true)),
    info: {
        help: {
            commandCategory: "Moderation",
            name: "/unmute",
            description: "Unmutes a user if they are currently muted.",
            usageExample: "/unmute (user)"
        },
        permission: "moderation.mute.remove"
    },
    async execute(interaction: ChatInputCommandInteraction ) {
        if (!interaction.guild || !interaction.member) return;

        const user = interaction.options.getUser('user');
        let server = await Server.findOrCreateServer(interaction.guild.id);
        if (!server) return;

        if (!server.settings.mute_role || !interaction.guild.roles.resolve(server.settings.mute_role)) {
            let errorEmbed = Embeds.ERROR_EMBED.toJSON();
            errorEmbed.description = "There is no mute role assigned for the server! Do `/help muterole` to view the command to add a muterole.";
            return await interaction.reply({ embeds: [errorEmbed] });
        }
        if (!user) return await interaction.reply({ embeds: [Embeds.ERROR_EMBED.toJSON()] });
        let muted = server.getPunishment(user.id, 'mute');
        if (!muted) {
            let errorEmbed = Embeds.ERROR_EMBED.toJSON();
            errorEmbed.description = "This user isn't muted!";
            return await interaction.reply({ embeds: [errorEmbed] });
        }
        let member = interaction.guild.members.resolve(user.id);

        if (member) {
            if (!await canExecute(interaction.guild, interaction.member as GuildMember, member)) {
                let noPermissionEmbed = Embeds.DENIED_EMBED.toJSON();
                noPermissionEmbed.title = "⛔ No Permission!"
                noPermissionEmbed.description = `This user has a higher role than you or owns this server!`
                return await interaction.reply({ embeds: [noPermissionEmbed] });
            }
            member.roles.remove(interaction.guild.roles.resolve(server.settings.mute_role) || "").catch(() => undefined);
        }
        muted.expired = true;
        await server.save();
        let dmEmbed = Embeds.SUCCESS_EMBED.toJSON();
        dmEmbed.title = "🔊 Unmuted";
        dmEmbed.description = `You were unmuted on ${interaction.guild.name}.`
        dmEmbed.fields = [toEmbedField(muted)]
        await user.send({ embeds: [dmEmbed] });
        let embed = Embeds.SUCCESS_EMBED.toJSON();
        embed.title = `🔊 Unmuted ${user.tag}`
        embed.description = `User was unmuted.`
        embed.fields = [toEmbedField(muted)]
        await server.log({
            user_id: interaction.user.id,
            description: "A user was unmuted.",
            date_unix: Date.now(),
            type: LogType.UNMUTE,
            punishment: muted
        }, interaction.guild)
        await interaction.reply({ embeds: [embed] });
    },

}
module.exports = unmuteCommand;