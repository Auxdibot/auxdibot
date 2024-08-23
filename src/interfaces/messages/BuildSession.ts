import { APIEmbed } from '@prisma/client';

export interface BuildSession {
   userID: string;
   embed: Partial<APIEmbed>;
   content?: string;
   last_interaction: Date;
   webhook_url: string;
}
