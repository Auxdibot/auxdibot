import express from "express";
import passport from "passport";

const authRouter = express.Router()

authRouter.get('/discord', passport.authenticate('discord'));

authRouter.get('/discord/callback', passport.authenticate('discord', {
    failureRedirect: "/",
    successRedirect: "/",
    failureMessage: "Couldn't authorize you on Discord."
}));



export default authRouter;