import Button from "../util/types/Button";
import {
    GuildMember,
    MessageComponentInteraction
} from "discord.js";
import canExecute from "../util/functions/canExecute";
import Embeds from "../util/constants/Embeds";
import {LogType} from "../mongo/schema/Log";
import Server from "../mongo/model/Server";
import {toEmbedField} from "../mongo/schema/Punishment";

module.exports = <Button>{
    name: "unmute",
    permission: "moderation.mute.remove",
    async execute(interaction: MessageComponentInteraction) {
        if (!interaction.guild || !interaction.user || !interaction.channel) return;
        let [,user_id] = interaction.customId.split("-");
        let server = await Server.findOrCreateServer(interaction.guild.id);
        if (!server) return;

        if (!server.settings.mute_role || !interaction.guild.roles.resolve(server.settings.mute_role)) {
            let errorEmbed = Embeds.ERROR_EMBED.toJSON();
            errorEmbed.description = "There is no mute role assigned for the server! Do `/help muterole` to view the command to add a muterole.";
            return await interaction.reply({ embeds: [errorEmbed] });
        }
        let muted = server.getPunishment(user_id, 'mute');
        if (!muted) {
            let errorEmbed = Embeds.ERROR_EMBED.toJSON();
            errorEmbed.description = "This user isn't muted!";
            return await interaction.reply({ embeds: [errorEmbed] });
        }
        let member = interaction.guild.members.resolve(user_id);
        let embed = Embeds.SUCCESS_EMBED.toJSON();

        if (member) {
            if (!await canExecute(interaction.guild, interaction.member as GuildMember, member)) {
                let noPermissionEmbed = Embeds.DENIED_EMBED.toJSON();
                noPermissionEmbed.title = "⛔ No Permission!"
                noPermissionEmbed.description = `This user has a higher role than you or owns this server!`
                return await interaction.reply({ embeds: [noPermissionEmbed] });
            }
            member.roles.remove(interaction.guild.roles.resolve(server.settings.mute_role) || "").catch(() => undefined);
            let dmEmbed = Embeds.SUCCESS_EMBED.toJSON();
            dmEmbed.title = "🔊 Unmuted";
            dmEmbed.description = `You were unmuted on ${interaction.guild.name}.`
            dmEmbed.fields = [toEmbedField(muted)]
            await member.user.send({ embeds: [dmEmbed] });

        }
        let user = interaction.client.users.resolve(user_id);
        muted.expired = true;
        await server.save();
        embed.title = `🔊 Unmuted ${user ? user.tag : `<@${user_id}>`}`
        embed.description = `User was unmuted.`
        embed.fields = [toEmbedField(muted)]
        await server.log({
            user_id: interaction.user.id,
            description: "A user was unmuted.",
            date_unix: Date.now(),
            type: LogType.UNMUTE,
            punishment: muted
        }, interaction.guild)
        return await interaction.reply({ embeds: [embed] });
    }
}