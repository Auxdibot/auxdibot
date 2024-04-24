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
import setJoinDMEmbed from '@/modules/features/greetings/setJoinDMEmbed';

export const joinDMMessage = <AuxdibotSubcommand>{
   name: 'message',
   info: {
      module: Modules['Greetings'],
      description:
         'Set the join DM message.',
      usageExample:
         '/join_dm message [...embed parameters]',
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
               content: `Here's a preview of the new join DM embed!\n${server.join_dm_text || ''}`,
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
         await setJoinDMEmbed(auxdibot, server.serverID, newEmbed, content);
         const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
         embed.title = 'Success!';
         embed.description = `Set the join DM embed.`;
         await auxdibot.createReply(interaction, { embeds: [embed] });
      } catch (x) {
         return await handleError(auxdibot, 'EMBED_SEND_ERROR', 'There was an error sending that embed!', interaction);
      }
   },
};
