import express from "express";


const sessionRouter = express.Router()

sessionRouter.get('/', (req, res) => {
    return req.session.passport ? res.status(200).json(req.session.passport.user) : res.status(404).send("You do not have an active session!");
});
sessionRouter.get('/logout', (req, res) => req.session.destroy(() => res.status(200).send('You are now logged out!')));


export default sessionRouter;
