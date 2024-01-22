import { Auxdibot } from '@/interfaces/Auxdibot';
import { PrismaClient } from '@prisma/client';
export default async function connectPrisma(auxdibot: Auxdibot) {
   console.log('-> Connecting to MongoDB using Prisma...');
   try {
      const client = new PrismaClient();
      auxdibot.database = client;
      await client.$connect().then(() => console.log(`-> Connected to MongoDB!`));
   } catch (x) {
      console.error('! -> There was an issue trying to connect to MongoDB using Prisma!');
      console.error(x);
      return undefined;
   }
}
