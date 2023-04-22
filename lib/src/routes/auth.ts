import express from "express";
import passport from "passport";

const authRouter = express.Router()

authRouter.get('/discord', passport.authenticate('discord'));

authRouter.get('/discord/callback', passport.authenticate('discord', {
    failureMessage: "Couldn't authorize you on Discord."
}), (req: express.Request, res: express.Response) => {
    return req.session.passport?.user ? res.status(200).redirect('/')
        : res.status(400).send('Couldn\'t authorize you!');
});



export default authRouter;