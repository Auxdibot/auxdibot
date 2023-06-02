import { Auxdibot } from '@/interfaces/Auxdibot';
import { PrismaClient } from '@prisma/client';
export default async function connectPrisma(auxdibot: Auxdibot) {
   try {
      const client = new PrismaClient();
      auxdibot.database = client;
      await client.$connect();
   } catch (x) {
      console.log('There was an issue trying to connect to MongoDB using Prisma!');
      return undefined;
   }
}
