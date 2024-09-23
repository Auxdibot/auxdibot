import { Auxdibot } from '@/Auxdibot';
import { UserBadge } from '@prisma/client';
import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';

export default function initDiscord(auxdibot: Auxdibot) {
   passport.use(
      new DiscordStrategy(
         {
            clientID: process.env.DISCORD_BOT_CLIENT_ID,
            clientSecret: process.env.DISCORD_OAUTH2_CLIENT_SECRET,
            scope: ['identify', 'guilds'],
            callbackURL: process.env.DISCORD_OAUTH2_CALLBACK_URL,
         },
         function (accessToken, refreshToken, profile, cb) {
            auxdibot.database.users
               .upsert({
                  where: { userID: profile.id },
                  create: {
                     badges: [
                        Date.now() < 1709182800000 && profile.guilds?.find((i) => auxdibot.guilds.cache.get(i.id))
                           ? UserBadge.OLD_USER
                           : null,
                     ].filter((i) => i),
                     userID: profile.id,
                  },
                  update: {},
                  select: {
                     badges: true,
                     userID: true,
                     voted_date: true,
                  },
               })
               .then(async (data) => {
                  if (
                     !data.badges.includes(UserBadge.OLD_USER) &&
                     Date.now() < 1709182800000 &&
                     profile.guilds?.find((i) => auxdibot.guilds.cache.get(i.id))
                  )
                     return await auxdibot.database.users.update({
                        where: { userID: data.userID },
                        data: { badges: { push: UserBadge.OLD_USER } },
                     });
                  return data;
               })
               .then((data) => {
                  cb(null, { ...profile, ...data });
               });
         },
      ),
   );
}
