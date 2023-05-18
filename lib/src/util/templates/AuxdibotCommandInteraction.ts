import { ChatInputCommandInteraction } from 'discord.js';
import { BaseAuxdibotCommandData } from '../types/AuxdibotCommandData';

export default interface AuxdibotCommandInteraction<Data extends BaseAuxdibotCommandData>
   extends ChatInputCommandInteraction {
   data?: Data;
}
