import { EmbedField } from 'discord.js';

/**
 * LogOptions Interface
 */
export interface LogOptions {
   /**
    * The list of Embed Fields to use for the log
    * @type {EmbedField[]}
    * @default []
    * @memberof LogOptions
    */
   fields?: EmbedField[];
   /**
    * Whether or not to apply the user's avatar to the log embed
    * @type {boolean}
    * @default undefined
    * @memberof LogOptions
    */
   user_avatar?: boolean;
}
