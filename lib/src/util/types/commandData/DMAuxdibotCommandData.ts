import { User } from 'discord.js';
import BaseAuxdibotCommandData from './BaseAuxdibotCommandData';

export default interface DMAuxdibotCommandData extends BaseAuxdibotCommandData {
   dmCommand?: true;
   date: Date;
   user: User;
}
