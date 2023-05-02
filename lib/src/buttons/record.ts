import AuxdibotButton from "../util/types/AuxdibotButton";
import {MessageComponentInteraction} from "discord.js";
import Server from "../mongo/model/server/Server";
import Embeds from "../util/constants/Embeds";


module.exports = <AuxdibotButton>{
    name: "record",
    permission: "moderation.record",
    async execute(interaction: MessageComponentInteraction) {
        if (!interaction.guild || !interaction.user || !interaction.channel) return;
        let [,user_id] = interaction.customId.split("-");
        let server = await Server.findOrCreateServer(interaction.guild.id)
        let embed = await server.recordAsEmbed(user_id);
        if (!embed) return await interaction.reply({ embeds: [Embeds.ERROR_EMBED.toJSON()] })
        return await interaction.reply({ embeds: [embed] });
    }
}