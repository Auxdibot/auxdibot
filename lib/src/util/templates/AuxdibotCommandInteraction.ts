import {ChatInputCommandInteraction} from "discord.js";
import BaseAuxdibotCommandData from "../types/commandData/BaseAuxdibotCommandData";

export default interface AuxdibotCommandInteraction<Data extends BaseAuxdibotCommandData> extends ChatInputCommandInteraction {
    data?: Data;
}