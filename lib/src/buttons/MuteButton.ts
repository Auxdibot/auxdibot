import Button from "../util/types/Button";
import {
    GuildMember,
    MessageComponentInteraction
} from "discord.js";
import {canExecute} from "../util/Actions";
import Embeds from "../util/constants/Embeds";
import {IPunishment, toEmbedField} from "../mongo/schema/Punishment";
import {LogType} from "../mongo/schema/Log";
import Server from "../mongo/model/Server";

module.exports = <Button>{
    name: "mute",
    permission: "moderation.mute",
    async execute(interaction: MessageComponentInteraction) {
        if (!interaction.guild || !interaction.user || !interaction.channel) return;
        let [,user_id] = interaction.customId.split("-");
        let member = interaction.guild.members.resolve(user_id);
        if (!member) {
            let embed = Embeds.ERROR_EMBED.toJSON();
            embed.description = "This user is not in the server!";
            return await interaction.reply({ embeds: [embed] });
        }


        if (!await canExecute(interaction.guild, interaction.member as GuildMember, member)) {
            let noPermissionEmbed = Embeds.DENIED_EMBED.toJSON();
            noPermissionEmbed.title = "⛔ No Permission!"
            noPermissionEmbed.description = `This user has a higher role than you or owns this server!`
            return await interaction.reply({ embeds: [noPermissionEmbed] });
        }
        let server = await Server.findOrCreateServer(interaction.guild.id);
        if (server.getPunishment(user_id, 'mute')) {
            let errorEmbed = Embeds.ERROR_EMBED.toJSON();
            errorEmbed.description = "This user is already muted!";
            return await interaction.reply({ embeds: [errorEmbed] });
        }
        member.roles.add(interaction.guild.roles.resolve(server.settings.mute_role || "") || "").then(async () => {
            if (!interaction.guild || !member) return;
            let muteData = <IPunishment>{
                type: "mute",
                reason: "No reason given.",
                date_unix: Date.now(),
                dmed: false,
                expired: false,
                expires_date_unix: undefined,
                user_id: user_id,
                moderator_id: interaction.user.id,
                punishment_id: await server.getPunishmentID(),
            };
            let dmEmbed = Embeds.PUNISHED_EMBED.toJSON();
            dmEmbed.title = "🔇 Mute";
            dmEmbed.description = `You were muted on ${interaction.guild ? interaction.guild.name : "Server"}.`
            dmEmbed.fields = [toEmbedField(muteData)]
            muteData.dmed = await member.user.send({embeds: [dmEmbed]}).then(() => true).catch(() => false);
            server.punish(muteData).then(async (embed) => {
                if (!embed || !interaction.guild) return;
                await server.log({
                    user_id: interaction.user.id,
                    description: "A user was muted.",
                    date_unix: Date.now(),
                    type: LogType.MUTE,
                    punishment: muteData
                }, interaction.guild)
                return await interaction.reply({embeds: [embed]});
            });
        }).catch(async () => {
            let errorEmbed = Embeds.ERROR_EMBED.toJSON();
            errorEmbed.description = `Could not mute this user! Check and see if Auxdibot has the Manage Roles permission, or if the <@&${server.settings.mute_role}> role is above Auxdibot in the role hierarchy.`
            return await interaction.reply({ embeds: [errorEmbed] });
        });
        return;
    }
}