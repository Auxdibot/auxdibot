import {ActivityType, Client, Collection, GatewayIntentBits, Partials, REST, Routes} from "discord.js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import Server from "../mongo/model/server/Server";
import {IAuxdibot} from "../util/templates/IAuxdibot";
import {client} from "../index";
import {LogType} from "../util/types/Log";

// Configure .env
dotenv.config();
export const TOKEN = process.env.DISCORD_BOT_TOKEN;
export const CLIENT_ID = process.env.DISCORD_BOT_CLIENT_ID;
export class AuxdibotClient {
    public client: IAuxdibot | undefined;
    async init() {
        if (!TOKEN) throw new Error("You need to include a discord token in .env!");
        if (!CLIENT_ID) throw new Error("You need to include a client id in .env!");
        /********************************************************************************/
        // Create Client

        const client: IAuxdibot = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildModeration,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.DirectMessageReactions,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ],
            partials: [Partials.Channel, Partials.Reaction, Partials.Message, Partials.GuildMember, Partials.User],
            presence: {
                activities: [{
                    type: ActivityType.Listening,
                    name: "[[loading ASMR intensifies]]"
                }]
            },
        });

        /********************************************************************************/
        // Declare client variables

        client.commands = new Collection();
        client.buttons = new Collection();
        client.getMembers = async function() {
            return await this.guilds.cache.reduce(async (acc: Promise<number> | number, guild) => ((await acc)+((guild.memberCount || (await guild.fetch()).memberCount) || 0)), 0);
        }
        client.updateDiscordStatus = async function() {
            if (this.user) return this.user.setPresence({
                activities: [{
                    type: ActivityType.Watching,
                    name: `${this.guilds.cache.size} servers | ${this.getMembers ? await this.getMembers() : "0"} members`
                }]
            });
            return undefined;
        }
        /********************************************************************************/
        // Declare commands


        const rest = new REST({
            version: '10'
        }).setToken(TOKEN);

        let commands = [];
        const PACKAGES = ['general', 'moderation', 'settings', 'permissions', 'embeds', 'roles', 'suggestions', 'levels'];
        let commandFiles = [{
            dir: "",
            files: fs.readdirSync(path.join(__dirname, "..", "commands")).filter(file => file.endsWith('.js'))
        }];

        for (const packageString of PACKAGES) {
            const packageFile = path.join(__dirname, "..", "commands", packageString);
            if (fs.existsSync(packageFile)) {
                commandFiles.push({
                    dir: packageString,
                    files: fs.readdirSync(packageFile).filter(file => file.endsWith('.js'))
                });
            }
        }
        for (const packageFile of commandFiles) {
            for (let file of packageFile.files) {
                let fileRequire = require(`../commands/${packageFile.dir}/${file}`);
                if (fileRequire.data) {
                    commands.push(fileRequire.data);
                    if (client.commands) {
                        client.commands.set(fileRequire.data.name, fileRequire);
                    }
                }
            }
        }
        await (async () => {
            try {
                console.log(`Started refreshing ${commands.length} slash commands.`);
                await rest.put(
                    Routes.applicationCommands(CLIENT_ID), {
                        body: commands
                    }
                )
            } catch (x) {
                console.error(x);
            }
        })();

        /********************************************************************************/
        // Declare buttons

        let buttons = [];
        let buttonFiles = fs.readdirSync(path.join(__dirname, "..", "buttons")).filter(file => file.endsWith('.js'));
        for (const file of buttonFiles) {

            let fileRequire = require(`../buttons/${file}`);
            if (fileRequire) {
                buttons.push(fileRequire);
                if (client.buttons) {
                    client.buttons.set(fileRequire.name, fileRequire);
                }
            }
        }

        /********************************************************************************/
        // Declare events

        const eventFiles = fs.readdirSync(path.join(__dirname, "..", "/events")).filter((file) => file.endsWith(".js"));

        for (const file of eventFiles) {
            const event = require(`../events/${file}`);
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args, client));
            } else {
                client.on(
                    event.name,
                    async (...args) => await event.execute(...args, client)
                );
            }
        }

        client.login(TOKEN).then(() => {
            console.log("Auxdibot is loaded!")
            if (client.updateDiscordStatus) client.updateDiscordStatus();
            setInterval(async () => {
                for (let guild of client.guilds.cache.values()) {
                    let server = await Server.findOrCreateServer(guild.id);
                    let serverData = await server.fetchData(), settings = await server.fetchSettings();
                    if (!serverData) return;
                    let expired = serverData.checkExpired();
                    if (expired) {
                        for (let expiredPunishment of expired) {
                            await server.log({
                                type: LogType.PUNISHMENT_EXPIRED,
                                description: `Punishment ID ${expiredPunishment.punishment_id} has expired.`,
                                date_unix: Date.now(),
                                punishment: expiredPunishment
                            });
                            switch (expiredPunishment.type) {
                                case "ban":
                                    await guild.bans.remove(expiredPunishment.user_id, "Punishment expired.");
                                    break;
                                case "mute":
                                    let member = guild.members.resolve(expiredPunishment.user_id);
                                    if (!member || !settings.mute_role) break;
                                    await member.roles.remove(settings.mute_role);
                                    break;
                            }
                        }
                    }
                }
            }, 60000)
        }).catch(reason => {
            console.log("Error signing into into Auxdibot!");
            console.error(reason);
        });
        this.client = client;
        return client;
    }
}
