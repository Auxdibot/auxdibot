import {Client, ClientPresence, Collection} from "discord.js";
import AuxdibotCommand from "./AuxdibotCommand";
import AuxdibotButton from "../types/AuxdibotButton";

export interface IAuxdibot extends Client {
    commands?: Collection<string, AuxdibotCommand>;
    buttons?: Collection<string, AuxdibotButton>;
    getMembers?(): Promise<number>;
    updateDiscordStatus?(): Promise<ClientPresence | undefined>;
}