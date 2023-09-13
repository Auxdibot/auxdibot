import { Guild } from 'discord.js';
import { Strategy } from 'passport-discord';

declare global {
   namespace Express {
      // eslint-disable-next-line @typescript-eslint/no-empty-interface
      export interface User extends Strategy.Profile {}

      interface Request {
         guildData: Strategy.GuildInfo;
         guild: Guild;
      }
   }
}
