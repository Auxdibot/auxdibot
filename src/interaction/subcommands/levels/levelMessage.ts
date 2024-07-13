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
import setLevelMessage from '@/modules/features/levels/setLevelMessage';

export const levelMessage = <AuxdibotSubcommand>{
   name: 'set',
   group: 'message',
   info: {
      module: Modules['Levels'],
      description:
         "Set the levelup message. (Use %LEVEL_FROM% for the user's previous level and %LEVEL_TO% for the user's new level)",
      usageExample: '/level message [...embed parameters]',
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
               content: `Here's a preview of the new levelup message!\n${
                  (await parsePlaceholders(auxdibot, content, {
                     guild: interaction.data.guild,
                     member: interaction.data.member,
                     levelup: { from: 0, to: 1 },
                  })) || ''
               }`,
               embeds: newEmbed && [
                  JSON.parse(
                     await parsePlaceholders(auxdibot, JSON.stringify(newEmbed), {
                        guild: interaction.data.guild,
                        member: interaction.data.member,
                        levelup: { from: 0, to: 1 },
                     }),
                  ),
               ],
            });
         await setLevelMessage(auxdibot, server.serverID, newEmbed, content);
         const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
         embed.title = 'Success!';
         embed.description = `Set the levelup message.`;
         await auxdibot.createReply(interaction, { embeds: [embed] });
      } catch (x) {
         console.log(x);
         return await handleError(auxdibot, 'EMBED_SEND_ERROR', 'There was an error sending that embed!', interaction);
      }
      return;
   },
};
