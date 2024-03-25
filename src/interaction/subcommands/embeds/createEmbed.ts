import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
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

export const createEmbed = <AuxdibotSubcommand>{
   name: 'create',
   info: {
      module: Modules['Messages'],
      usageExample:
         '/embed create (channel) [content] [color] [title] [title url] [author] [author icon url] [author url] [description] [fields (split title and description with `"|d|"``, and seperate fields with `"|s|"`)] [footer] [footer icon url] [image url] [thumbnail url]',
      description: 'Create an embed with Auxdibot.',
      permission: 'embed.create',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const channel = interaction.options.getChannel('channel', true, [ChannelType.GuildText]);
      const content = interaction.options.getString('content')?.replace(/\\n/g, '\n') || '';
      const parameters = argumentsToEmbedParameters(interaction);

      try {
         const apiEmbed = toAPIEmbed(
            JSON.parse(
               await parsePlaceholders(
                  auxdibot,
                  JSON.stringify(parameters),
                  interaction.data.guild,
                  interaction.data.member,
               ),
            ),
         );
         await sendEmbed(
            channel,
            await parsePlaceholders(auxdibot, content, interaction.data.guild, interaction.data.member),
            apiEmbed,
         );
      } catch (x) {
         console.error(x);
         return await handleError(auxdibot, 'EMBED_SEND_ERROR', 'There was an error sending that embed!', interaction);
      }

      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.title = 'Success!';
      embed.description = `Sent embed to ${channel}.`;
      return await auxdibot.createReply(interaction, { embeds: [embed] });
   },
};
