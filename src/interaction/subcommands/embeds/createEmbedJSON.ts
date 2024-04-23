import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import sendEmbed from '@/modules/features/embeds/sendEmbed';
import handleError from '@/util/handleError';
import parsePlaceholders from '@/util/parsePlaceholder';
import { EmbedBuilder } from '@discordjs/builders';
import { APIEmbed, ChannelType } from 'discord.js';

export const createEmbedJSON = <AuxdibotSubcommand>{
   name: 'create_json',
   info: {
      module: Modules['Messages'],
      usageExample: '/embed create_json (channel) (json) [webhook_url]',
      description: 'Create an embed with Auxdibot using valid Discord Embed JSON data.',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const channel = interaction.options.getChannel('channel', true, [ChannelType.GuildText]);
      const json = interaction.options.getString('json', true);
      const webhook_url = interaction.options.getString('webhook_url');
      try {
         const apiEmbed = JSON.parse(
            await parsePlaceholders(auxdibot, json, interaction.data.guild, interaction.data.member),
         ) satisfies APIEmbed;

         await sendEmbed(channel, undefined, apiEmbed, webhook_url);
      } catch (x) {
         return await handleError(
            auxdibot,
            'EMBED_SEND_ERROR_JSON',
            typeof x === 'object' && 'message' in x
               ? (x as { message: string }).message
               : 'There was an error sending that embed!',
            interaction,
         );
      }

      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.title = 'Success!';
      embed.description = `Sent embed to ${channel}.`;
      return await auxdibot.createReply(interaction, { embeds: [embed] });
   },
};
