// Commented out prior to adding DJS new version

/*import { Auxdibot } from '@/Auxdibot';
import { Guild } from 'discord.js';



export async function hasPremium(auxdibot: Auxdibot, guild: Guild) {
   if (!process.env.PREMIUM_SKU_ID) return true;
   const entitlements =
      guild &&
      (await auxdibot.application.entitlements.fetch({ guild: guild?.id, skus: [process.env.PREMIUM_SKU_ID] }));
   return !entitlements || entitlements.filter((i) => i.skuId == process.env.PREMIUM_SKU_ID).size === 0;
}*/
