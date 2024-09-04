import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleError from '@/util/handleError';
import parsePlaceholders from '@/util/parsePlaceholder';
import { EmbedBuilder } from '@discordjs/builders';
import setLevelMessage from '@/modules/features/levels/setLevelMessage';
import { ChannelType } from 'discord.js';

export const levelMessage = <AuxdibotSubcommand>{
   name: 'set',
   group: 'message',
   info: {
      module: Modules['Levels'],
      description:
         "Set the levelup message. (See /embed storage list for stored embeds, Use %LEVEL_FROM% for the user's previous level and %LEVEL_TO% for the user's new level)",
      usageExample: '/level message set (id)',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const server = interaction.data.guildData;
      const id = interaction.options.getString('id');
      if (!id) {
         await setLevelMessage(auxdibot, server.serverID);
         const success = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
         success.title = 'Success!';
         success.description = `Cleared the levelup message.`;
         return await auxdibot.createReply(interaction, { embeds: [success] });
      }
      const stored = server.stored_embeds.find((i) => i.id === id);
      if (!stored) return handleError(auxdibot, 'EMBED_NOT_FOUND', 'Embed not found!', interaction);
      const { content, embed } = stored;
      try {
         if (interaction.channel && interaction.channel.type == ChannelType.GuildText)
            await interaction.channel.send({
               content: `Here's a preview of the new levelup message!${
                  !/level\_(from|to)/i.test(content) && !/level\_(from|to)/i.test(JSON.stringify(embed))
                     ? "\n\n**⚠️ WARNING**: There are no level placeholders in this message! Level data may not be clear to users. Use `%LEVEL_FROM%` and `%LEVEL_TO%` to display the user's leveling status."
                     : ''
               }\n${
                  (content &&
                     (await parsePlaceholders(auxdibot, content, {
                        guild: interaction.data.guild,
                        member: interaction.data.member,
                        levelup: { from: 0, to: 1 },
                     }))) ||
                  ''
               }`,
               embeds: embed && [
                  JSON.parse(
                     await parsePlaceholders(auxdibot, JSON.stringify(embed), {
                        guild: interaction.data.guild,
                        member: interaction.data.member,
                        levelup: { from: 0, to: 1 },
                     }),
                  ),
               ],
            });
         await setLevelMessage(auxdibot, server.serverID, embed, content);
         const success = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
         success.title = 'Success!';
         success.description = `Set the levelup message.`;
         await auxdibot.createReply(interaction, { embeds: [success] });
      } catch (x) {
         console.log(x);
         return await handleError(auxdibot, 'EMBED_SEND_ERROR', 'There was an error sending that embed!', interaction);
      }
      return;
   },
};
