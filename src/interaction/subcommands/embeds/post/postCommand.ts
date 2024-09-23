import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { toAPIEmbed } from '@/util/toAPIEmbed';
import argumentsToEmbedParameters from '@/util/argumentsToEmbedParameters';
import handleError from '@/util/handleError';
import parsePlaceholders from '@/util/parsePlaceholder';
import { EmbedBuilder } from '@discordjs/builders';
import { ChannelType } from 'discord.js';
import sendEmbed from '@/modules/features/embeds/sendEmbed';

export const postCommand = <AuxdibotSubcommand>{
   name: 'command',
   group: 'post',
   info: {
      module: Modules['Messages'],
      usageExample: '/embed post command (channel) [...embed parameters] [webhook_url]',
      description:
         'Post an embed using command parameters. (View `/embed parameters` for a detailed description of embed parameters.)',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const channel = interaction.options.getChannel('channel', true, [ChannelType.GuildText]);
      const content = interaction.options.getString('content')?.replace(/\\n/g, '\n') || '';
      const webhook_url = interaction.options.getString('webhook_url');
      const parameters = argumentsToEmbedParameters(interaction);
      await interaction.deferReply();
      try {
         const apiEmbed = toAPIEmbed(
            JSON.parse(
               await parsePlaceholders(auxdibot, JSON.stringify(parameters), {
                  guild: interaction.data.guild,
                  member: interaction.data.member,
               }),
            ),
         );
         await sendEmbed(
            channel,
            await parsePlaceholders(auxdibot, content, {
               guild: interaction.data.guild,
               member: interaction.data.member,
            }),
            apiEmbed,
            webhook_url,
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

      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.title = 'Success!';
      embed.description = `Sent embed to ${channel}.`;
      return await auxdibot.createReply(interaction, { embeds: [embed] });
   },
};
