import Button from "../util/types/Button";
import {
    GuildMember,
    MessageComponentInteraction
} from "discord.js";
import canExecute from "../util/functions/canExecute";
import Embeds from "../util/constants/Embeds";
import {IPunishment} from "../mongo/schema/Punishment";
import {LogType} from "../mongo/schema/Log";
import Server from "../mongo/model/Server";

module.exports = <Button>{
    name: "kick",
    permission: "moderation.kick",
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
        interaction.guild.members.kick(member.user, "No reason given.").then(async () => {
            if (!interaction.guild) return;
            let kickData = <IPunishment>{
                type: "kick",
                reason: "No reason given.",
                date_unix: Date.now(),
                dmed: false,
                expired: false,
                expires_date_unix: undefined,
                user_id: user_id,
                moderator_id: interaction.user.id,
                punishment_id: await server.getPunishmentID(),
            };
            server.punish(kickData).then(async (embed) => {
                if (!embed || !interaction.guild) return;
                await server.log({
                    user_id: interaction.user.id,
                    description: "A user was kicked.",
                    date_unix: Date.now(),
                    type: LogType.KICK,
                    punishment: kickData
                }, interaction.guild)
                return await interaction.reply({ embeds: [embed] });
            });
        }).catch(async () => {
            let errorEmbed = Embeds.ERROR_EMBED.toJSON();
            errorEmbed.description = "Couldn't kick that user.";
            return await interaction.reply({ embeds: [errorEmbed] });
        });
        return;
    }
}