import { Channel, APIEmbed } from 'discord.js';

export default async function sendEmbed(channel: Channel, content?: string, embed?: APIEmbed) {
   if (!channel || !channel.isTextBased()) throw new Error("Can't send an embed to a non-text-based channel!");
   return await channel.send({ embeds: embed ? [embed] : undefined, content: content || '' }).catch((x) => {
      if (x.code == '50013') throw new Error('Auxdibot does not have permission to send messages!');
      throw new Error("Couldn't send that Embed!");
   });
}
