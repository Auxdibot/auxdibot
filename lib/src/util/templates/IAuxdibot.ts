import {Client, Collection} from "discord.js";
import Command from "./Command";
import Button from "../types/Button";

export interface IAuxdibot extends Client {
    commands?: Collection<string, Command>;
    buttons?: Collection<string, Button>;
}