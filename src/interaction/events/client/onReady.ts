import { Auxdibot } from '@/interfaces/Auxdibot';

export default async function onReady(auxdibot: Auxdibot) {
   console.log(`-> Logged in as ${auxdibot.user ? auxdibot.user.username : 'Client Not Found'}!`);
}
