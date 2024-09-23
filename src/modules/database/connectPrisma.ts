import { Auxdibot } from '@/Auxdibot';
import { PrismaClient } from '@prisma/client';
export default async function connectPrisma(auxdibot: Auxdibot) {
   console.log('-> Connecting to MongoDB using Prisma...');
   try {
      const client = new PrismaClient();
      auxdibot.database = client;
      await client.$connect().then(() => console.log(`\x1b[32m-> Connected to MongoDB!\x1b[0m`));
   } catch (x) {
      console.error('\x1b[31m! -> There was an issue trying to connect to MongoDB using Prisma!\x1b[0m');
      console.error(x);
      return undefined;
   }
}
