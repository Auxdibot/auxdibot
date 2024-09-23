import { Auxdibot } from '@/Auxdibot';
export default async function onReady(auxdibot: Auxdibot) {
   console.log(`\x1b[32m-> Logged in as ${auxdibot.user ? auxdibot.user.username : 'Client Not Found'}!\x1b[0m`);
}
