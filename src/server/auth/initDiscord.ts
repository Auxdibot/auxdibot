import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';

export default function initDiscord() {
   passport.use(
      new DiscordStrategy(
         {
            clientID: process.env.DISCORD_BOT_CLIENT_ID,
            clientSecret: process.env.DISCORD_OAUTH2_CLIENT_SECRET,
            scope: ['identify', 'guilds'],
            callbackURL: process.env.DISCORD_OAUTH2_CALLBACK_URL,
         },
         function (accessToken, refreshToken, profile, cb) {
            cb(null, profile);
         },
      ),
   );
}
