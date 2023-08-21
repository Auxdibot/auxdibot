import express from 'express';
import passport from 'passport';

const router = express.Router();

export const authRoute = () => {
   router.get('/', passport.session(), (req, res) =>
      res.json({ user: req.user, status: req.user ? 'authenticated' : 'unauthenticated' }).status(200),
   );
   router.get('/signout', (req, res) => req.session.destroy(() => res.redirect('/')));
   router.get('/discord', passport.authenticate('discord'));
   router.get(
      '/discord/callback',
      passport.authenticate('discord', {
         failureRedirect: '/',
      }),
      (req, res) => {
         return res.redirect('/');
      },
   );
   return router;
};
