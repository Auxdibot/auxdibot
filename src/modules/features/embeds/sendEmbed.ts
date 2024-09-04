import { Channel, APIEmbed, WebhookClient, ChannelType } from 'discord.js';

export default async function sendEmbed(channel: Channel, content?: string, embed?: APIEmbed, webhook_url?: string) {
   if (!channel || (channel.type != ChannelType.GuildText && channel.type != ChannelType.GuildVoice))
      throw new Error("Can't send an embed to a non-text-based channel!");

   if (webhook_url && !channel.isDMBased()) {
      if (!webhook_url.startsWith('https://discord.com/api/webhooks/')) throw new Error('Invalid Webhook URL!');
      const webhooks = await channel.fetchWebhooks().catch(() => {
         throw new Error('Auxdibot does not have permission to manage/view Webhooks in this channel!');
      });
      const webhook = webhooks.find((x) => x.url == webhook_url);
      if (!webhook) throw new Error('Invalid Webhook URL!');
      const client = new WebhookClient({ url: webhook_url });
      return await client.send({ embeds: embed ? [embed] : undefined, content: content || '' }).catch((x) => {
         if (x.code == 50027) throw new Error('Invalid Webhook URL!');
         if (x.code == 50013)
            throw new Error('Auxdibot does not have permission to send messages or use this webhook!');

         throw new Error("Couldn't send that Embed!");
      });
   }
   return await channel.send({ embeds: embed ? [embed] : undefined, content: content || '' }).catch((x) => {
      if (x.code == '50013') throw new Error('Auxdibot does not have permission to send messages!');
      throw new Error("Couldn't send that Embed!");
   });
}
