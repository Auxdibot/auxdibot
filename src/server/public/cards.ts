import { Auxdibot } from '@/Auxdibot';
import { UserBadge } from '@prisma/client';
import { Channel } from 'discord.js';
import { Express } from 'express';
/*
   Cards
   View server card info
   P.S Having to route this through the app itself for some reason, this one's gonna be running on hopes and dreams
*/
const cards = (auxdibot: Auxdibot, app: Express) => {
   app.get('/cards/:cardID', async (req, res) => {
      return await auxdibot.database.servercards
         .findFirst({ where: { serverID: req.params.cardID } })
         .then(async (card) => {
            if (!card) return res.status(404).json({ error: "couldn't find card" });
            const discordServer = await auxdibot.guilds.fetch(card.serverID);
            if (!discordServer) return res.status(404).json({ error: "couldn't find server" });
            const channel: Channel | undefined =
               card.featured_channel &&
               (await discordServer.channels.fetch(card.featured_channel).catch(() => undefined));
            const owner = await auxdibot.database.users.findFirst({
               where: { userID: discordServer?.ownerId || null },
            });

            return res.status(200).json({
               server: {
                  name: discordServer.name,
                  icon_url: discordServer.iconURL({ size: 256 }),
                  members: discordServer.memberCount,
                  acronym: discordServer.nameAcronym,
                  banner_url: discordServer.bannerURL({ size: 2048 }),
               },
               primary_color: card.background?.color1 ?? '#000000',
               description: card.description,
               background: card.background,
               header_font: card.header_font,
               public: card.public,
               rules: card.rules.slice(0, 10),
               text_font: card.text_font,
               invite_url: card.invite_url,
               dark: card.dark,
               badges: [
                  discordServer.memberCount >= 100 && 'HUNDRED_MEMBERS',
                  discordServer.memberCount >= 1000 && 'THOUSAND_MEMBERS',
                  card.featured && 'FEATURED',
                  card.public && 'PUBLIC',
                  owner?.badges.includes(UserBadge.OLD_USER) && 'OLD_OWNER',
               ].filter((i) => i),
               channel: channel &&
                  channel.isTextBased() &&
                  !channel.isDMBased() && {
                     name: channel.name,
                     messages: await channel.messages
                        .fetch({ limit: 3 })
                        .then((data) =>
                           data.map((i) => ({
                              author: i.author.username,
                              message: i.cleanContent,
                              date: i.createdTimestamp,
                           })),
                        )
                        .catch(() => undefined),
                  },
               featured: card.featured,
            });
         })
         .catch((x) => res.status(500).json({ error: 'an error occurred' }) && console.log(x));
   });

   return app;
};
export default cards;
