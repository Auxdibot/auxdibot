import { Client } from 'discord.js';

export default async function onReady(client: Client) {
   console.log(`Logged in as ${client.user ? client.user.tag : 'Client Not Found'}!`);
}
