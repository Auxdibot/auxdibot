import AuxdibotButton from "../util/types/AuxdibotButton";
import {
    MessageComponentInteraction
} from "discord.js";
import Embeds from "../util/constants/Embeds";
import {toEmbedField} from "../mongo/schema/PunishmentSchema";
import Server from "../mongo/model/server/Server";
import {LogType} from "../util/types/Log";

module.exports = <AuxdibotButton>{
    name: "unban",
    permission: "moderation.ban.remove",
    async execute(interaction: MessageComponentInteraction) {
        if (!interaction.guild || !interaction.user || !interaction.channel) return;
        let [,user_id] = interaction.customId.split("-");
        let server = await Server.findOrCreateServer(interaction.guild.id);
        if (!server) return;
        let data = await server.fetchData();
        let banned = data.getPunishment(user_id, 'ban');
        if (!banned) {
            let errorEmbed = Embeds.ERROR_EMBED.toJSON();
            errorEmbed.description = "This user isn't banned!";
            return await interaction.reply({ embeds: [errorEmbed] });
        }
        let user = interaction.client.users.resolve(user_id);
        let embed = Embeds.SUCCESS_EMBED.toJSON();

        banned.expired = true;
        await server.save();
        embed.title = `📥 Unbanned ${user ? user.tag : `<@${user_id}>`}`
        embed.description = `User was unbanned.`
        embed.fields = [toEmbedField(banned)];
        await server.log({
            user_id: interaction.user.id,
            description: "A user was unbanned.",
            date_unix: Date.now(),
            type: LogType.UNBAN,
            punishment: banned
        })
        return await interaction.reply({ embeds: [embed] });
    }
}