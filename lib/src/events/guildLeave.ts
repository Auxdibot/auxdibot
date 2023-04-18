import {Guild} from "discord.js";
import Server from "../mongo/model/Server";
import {updateDiscordStatus} from "../modules/discord";

module.exports = {
    name: 'guildDelete',
    once: false,
    async execute(guild: Guild) {
        if (!guild) return;
        await Server.deleteByDiscordId(guild.id.toString());
        await updateDiscordStatus()
        return;
    }
}