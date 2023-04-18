import Button from "../util/types/Button";
import {MessageComponentInteraction} from "discord.js";
import Server from "../mongo/model/Server";


module.exports = <Button>{
    name: "record",
    permission: "moderation.record",
    async execute(interaction: MessageComponentInteraction) {
        if (!interaction.guild || !interaction.user || !interaction.channel) return;
        let [,user_id] = interaction.customId.split("-");
        let server = await Server.findOrCreateServer(interaction.guild.id)
        let embed = server.recordAsEmbed(user_id);
        return interaction.reply({ embeds: [embed] });
    }
}