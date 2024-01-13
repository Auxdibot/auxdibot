import { Auxdibot } from '@/interfaces/Auxdibot';
import checkAuthenticated from '@/server/checkAuthenticated';
import checkGuildOwnership from '@/server/checkGuildOwnership';
import { verifyHex } from '@/util/verifyHex';
import { Fonts, GradientTypes } from '@prisma/client';
import { Router } from 'express';
/*
   Update Card
   Update this server's card.
*/
const updateCard = (auxdibot: Auxdibot, router: Router) => {
   router
      .route('/:serverID/updateCard')
      .post(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
         async (req, res) => {
            const {
               bg_color1,
               bg_color2,
               bg_gradient,
               dark,
               rules,
               description,
               header_font,
               text_font,
               channelID,
               invite_url,
            } = req.body;
            if (!verifyHex('#' + bg_color1) || !verifyHex('#' + bg_color2))
               return res.status(400).json({ error: 'Invalid hex code in background colors.' });
            if (!GradientTypes[bg_gradient])
               return res.status(400).json({ error: 'Invalid background gradient type.' });
            if (Array.isArray(rules) && rules.length > 10)
               return res.status(400).json({ error: 'Maximum of ten rules allowed.' });
            const checkLengthRules = rules?.findIndex((i) => i.length > 120);
            if (checkLengthRules != undefined && checkLengthRules != -1)
               return res.status(400).json({ error: 'Rule #' + (checkLengthRules + 1) + ' is too long!' });
            if ((description?.length ?? 0) > 500)
               return res.status(400).json({ error: 'Description is longer than 500 characters!' });
            if (!Fonts[header_font]) return res.status(400).json({ error: 'Invalid header font.' });
            if (!Fonts[text_font]) return res.status(400).json({ error: 'Invalid text font.' });
            const channel = await req.guild.channels.fetch(channelID).catch(() => undefined);
            if (channelID && !channel) return res.status(400).json({ error: 'Invalid channel.' });
            if (!/^https:\/\/discord\.gg\/(invite\/|)\w+$/.test(invite_url))
               return res.status(400).json({ error: 'Invalid invite link.' });
            const data = {
               background: {
                  color1: '#' + bg_color1,
                  color2: '#' + bg_color2,
                  gradient: bg_gradient,
               },
               featured_channel: channelID,
               dark: dark == 'true',
               description,
               rules: typeof rules == 'string' ? [rules] : rules,
               header_font,
               text_font,
               invite_url,
            };
            return auxdibot.database.servercards
               .upsert({
                  where: { serverID: req.guild.id },
                  update: data,
                  create: {
                     serverID: req.guild.id,
                     ...data,
                  },
               })
               .then((data) => res.status(200).json({ data }))
               .catch(() => res.status(500).json({ error: 'An error occurred.' }));
         },
      )
      .delete(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
         (req, res) => {
            return auxdibot.database.servercards
               .delete({ where: { serverID: req.guild.id } })
               .then(() => res.status(200).json({ success: 'Deleted servercard.' }))
               .catch(() => res.status(500).json({ error: 'An error occurred.' }));
         },
      );
   return router;
};
export default updateCard;
