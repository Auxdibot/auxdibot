import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleError from '@/util/handleError';
import parsePlaceholders from '@/util/parsePlaceholder';
import { EmbedBuilder } from '@discordjs/builders';
import { ChannelType } from 'discord.js';
import sendEmbed from '@/modules/features/embeds/sendEmbed';

export const postEmbed = <AuxdibotSubcommand>{
   name: 'post',
   info: {
      module: Modules['Messages'],
      usageExample: '/embed post (channel) (id)',
      description: 'Post a stored embed using its ID.',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const channel = interaction.options.getChannel('channel', true, [ChannelType.GuildText]);
      const id = interaction.options.getString('id', true);
      const embed = interaction.data.guildData.stored_embeds.find((i) => i.id === id);
      try {
         const apiEmbed = embed?.embed
            ? JSON.parse(
                 await parsePlaceholders(auxdibot, JSON.stringify(embed.embed), {
                    guild: interaction.data.guild,
                    member: interaction.data.member,
                 }),
              )
            : undefined;
         await sendEmbed(
            channel,
            embed?.content
               ? await parsePlaceholders(auxdibot, embed.content, {
                    guild: interaction.data.guild,
                    member: interaction.data.member,
                 })
               : '',
            apiEmbed,
            embed.webhook_url,
         );
      } catch (x) {
         return await handleError(
            auxdibot,
            'EMBED_SEND_ERROR',
            typeof x === 'object' && 'message' in x
               ? (x as { message: string }).message
               : 'There was an error sending that embed!',
            interaction,
         );
      }

      const success = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      success.title = 'Success!';
      success.description = `Sent embed to ${channel}.`;
      return await auxdibot.createReply(interaction, { embeds: [success] });
   },
};
