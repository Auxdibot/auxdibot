import {Guild} from "discord.js";
import Embeds from '../util/constants/Embeds';
import Server from "../mongo/model/server/Server";
import {updateDiscordStatus} from "../modules/discord";

module.exports = {
    name: 'guildCreate',
    once: false,
    async execute(guild: Guild) {
        if (!guild) return;
        await Server.findOrCreateServer(guild.id.toString());
        let channel = guild.systemChannel;
        if (!channel) return;
        await updateDiscordStatus();
        return await channel.send({ embeds: [Embeds.WELCOME_EMBED.toJSON()] });
    }
}