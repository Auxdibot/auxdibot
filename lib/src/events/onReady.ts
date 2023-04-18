import {Client} from "discord.js";

module.exports = {
    name: 'ready',
    once: true,
    async execute(client: Client) {
        console.log(`Logged in as ${client.user ? client.user.tag : "Client Not Found"}!`)
    }
}