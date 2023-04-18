import express from "express";

export function validateUser(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!req.session.passport) {
        res.status(400).send("You do not have permission to access this!");
        next('route')
        return false;
    }
    next();
    return true;
}