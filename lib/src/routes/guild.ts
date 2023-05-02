import express from "express";
import {validateUser} from "../util/middleware";
import Server from "../mongo/model/server/Server";
import {GuildInfo} from "passport-discord";

const guildRouter = express.Router();

const getGuildData = async (guild_info: GuildInfo) => {
    let guildData = await Server.findOne({ discord_id: guild_info.id }, { _id: 0 }).exec().catch(() => undefined);
    if (guildData) {
        let data = await guildData.fetchData(), settings = await guildData.fetchSettings();
        return { ...guild_info, punishments: data.punishments, settings: settings, invited: true };
    }
    return {...guild_info, invited: false };
}
guildRouter.get('/:guildId', validateUser, async (req: express.Request, res: express.Response) => {
    if (!req.session.passport?.user.discord_guilds) return res.status(400).send("Couldn't find any servers!")
    let guildId = req.params['guildId'];
    if (!guildId) return res.status(400).send("Please specify a guild id!");
    let guilds = req.session.passport.user.discord_guilds;
    let guild = guilds.filter(guild => guild.id == req.params['guildId'])[0];
    if (!guild) return res.status(404).send("You do not own this server or it doesn't exist!");
    let data = await getGuildData(guild);
    return data ? res.status(200).json(data) : res.status(404).send("Data for this server could not be found!");
});
guildRouter.get('/', validateUser, async (req: express.Request, res: express.Response) => {
    if (!req.session.passport?.user.discord_guilds) return res.status(404).send("Couldn't find any servers!");

    return res.status(200).json(await Promise.all(req.session.passport.user.discord_guilds.map(async (guild) => await getGuildData(guild))));
})
export default guildRouter;
