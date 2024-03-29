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
import { APIEmbed } from '@prisma/client';
import setJoinEmbed from '@/modules/features/greetings/setJoinEmbed';

export const joinMessage = <AuxdibotSubcommand>{
   name: 'message',
   info: {
      module: Modules['Greetings'],
      description:
         'Set the join message. (Placeholders are supported. Do /help placeholders for a list of placeholders.)',
      usageExample:
         '/join message [content] [color] [title] [title url] [author] [author icon url] [author url] [description] [fields (split title and description with "|d|", and seperate fields with "|s|")] [footer] [footer icon url] [image url] [thumbnail url]',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const server = interaction.data.guildData;
      const content = interaction.options.getString('content');
      const parameters = argumentsToEmbedParameters(interaction);
      try {
         const newEmbed = toAPIEmbed(parameters) as APIEmbed;
         if (interaction.channel && interaction.channel.isTextBased())
            await interaction.channel.send({
               content: `Here's a preview of the new join embed!\n${server.join_dm_text || ''}`,
               embeds: [
                  JSON.parse(
                     await parsePlaceholders(
                        auxdibot,
                        JSON.stringify(newEmbed),
                        interaction.data.guild,
                        interaction.data.member,
                     ),
                  ),
               ],
            });
         await setJoinEmbed(auxdibot, server.serverID, newEmbed, content);
         const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
         embed.title = 'Success!';
         embed.description = `Set the join embed.`;
         await auxdibot.createReply(interaction, { embeds: [embed] });
      } catch (x) {
         return await handleError(auxdibot, 'EMBED_SEND_ERROR', 'There was an error sending that embed!', interaction);
      }
      return;
   },
};
