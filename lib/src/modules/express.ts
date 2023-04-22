import passport, {Strategy} from "passport";
import {Strategy as DiscordStrategy} from "passport-discord";
import User from "../mongo/model/User";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import authRouter from "../routes/auth";
import sessionRouter from "../routes/session";
import guildRouter from "../routes/guild";
import dotenv from "dotenv";

dotenv.config();
type UserType = { mongo_id: string, discord_id: string, discord_tag: string, discord_icon: string | null, discord_guilds: DiscordStrategy.GuildInfo[] };
declare module 'express-session' {
    interface SessionData {
        bearer_token: string | undefined;
        bot_token: string | undefined;
        passport: { user: UserType };
    }
}
export class AuxdibotAPI {
    async init() {
        let scopes = ['identify', 'guilds'];

        passport.use(new DiscordStrategy({
            clientID: process.env.OAUTH2_CLIENT_ID || "",
            clientSecret: process.env.OAUTH2_CLIENT_SECRET || "",
            callbackURL: process.env.OAUTH2_REDIRECT_URL,
            scope: scopes
        }, function(accessToken, refreshToken, profile, cb) {
            User.findOneAndUpdate({ discord_id: profile.id }, {}, { upsert: true, new: true }).then( (data) => {
                if (!data) return cb(new Error('No user found.'), undefined);
                return cb(undefined, <UserType>{
                    mongo_id: data._id.toString(),
                    discord_id: profile.id,
                    discord_tag: `${profile.username}#${profile.discriminator}`,
                    discord_icon: profile.avatar,
                    discord_guilds: profile.guilds ? profile.guilds.filter((guild) => (guild.owner || (guild.permissions & 0x08) == 0x08)) : []
                });
            }).catch((err) => cb(err, undefined));
        }) as Strategy);

        passport.serializeUser(function(user: Express.User, done) {
            done(null, user);
        });

        passport.deserializeUser(function(user: Express.User, done) {
            done(null, user);
        });

        const app = express();
        const port = process.env.EXPRESS_PORT || 5000;
        let whitelist = ["https://bot.auxdible.me", "http://localhost:5173"];
        app.use(cors({
            optionsSuccessStatus: 200,
            credentials: true,
            origin: whitelist
        }));

        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.use(cookieParser());

        app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            console.log(`${req.url} | ${req.ip}`);
            next();
        })

        app.use(session({
            secret: process.env.EXPRESS_SESSION_SECRET || crypto.randomUUID(),
            saveUninitialized: true,
            cookie: { maxAge: 1000 * 60 * 60 * 24 },
            resave: false
        }));

        app.use('/api/auth', authRouter);
        app.use('/api/session', sessionRouter);
        app.use('/api/guilds', guildRouter);

        app.listen(port, () => {
            console.log(`Express app listening on ${port}!`)
        });

        return app;
    }
}
