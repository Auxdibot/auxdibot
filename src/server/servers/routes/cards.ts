import { Auxdibot } from '@/interfaces/Auxdibot';
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
            return res.status(200).json({
               server: {
                  name: discordServer.name,
                  icon_url: discordServer.iconURL({ size: 256 }),
                  members: discordServer.memberCount,
               },
               primary_color: card.background?.color1 ?? '#000000',
               description: card.description,
               background: card.background,
               header_font: card.header_font,
               public: card.public,
               rules: card.rules,
               text_font: card.text_font,
               invite_url: card.invite_url,
               featured: card.featured,
            });
         })
         .catch((x) => res.status(500).json({ error: 'an error occurred' }) && console.log(x));
   });

   return app;
};
export default cards;
