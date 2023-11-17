import { Snowflake } from 'discord.js';

export interface CachedMessage {
   readonly message: Snowflake;
   readonly channel: Snowflake;
   readonly attachments: boolean;
   readonly author: Snowflake;
   readonly invites: boolean;
}
