import { ChatInputCommandInteraction } from 'discord.js';
import { BaseAuxdibotCommandData } from './AuxdibotCommandData';

export default interface AuxdibotCommandInteraction<Data extends BaseAuxdibotCommandData>
   extends ChatInputCommandInteraction {
   data?: Data;
}
