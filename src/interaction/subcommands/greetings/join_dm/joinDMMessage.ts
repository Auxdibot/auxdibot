import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleError from '@/util/handleError';
import parsePlaceholders from '@/util/parsePlaceholder';
import { EmbedBuilder } from '@discordjs/builders';
import setJoinDMEmbed from '@/modules/features/greetings/setJoinDMEmbed';

export const joinDMMessage = <AuxdibotSubcommand>{
   name: 'message',
   group: 'join_dm',
   info: {
      module: Modules['Greetings'],
      description: 'Set the join DM message. (See /embeds storage list for stored embeds.)',
      usageExample: '/greetings join_dm message (id)',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const server = interaction.data.guildData;
      const id = interaction.options.getString('id');
      if (!id) {
         await setJoinDMEmbed(auxdibot, server.serverID);
         const success = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
         success.title = 'Success!';
         success.description = `Cleared the Join DM embed.`;
         return await auxdibot.createReply(interaction, { embeds: [success] });
      }
      const stored = server.stored_embeds.find((i) => i.id === id);
      if (!stored) return handleError(auxdibot, 'EMBED_NOT_FOUND', 'Embed not found!', interaction);
      const { content, embed } = stored;
      try {
         if (interaction.channel && interaction.channel.isTextBased())
            await interaction.channel.send({
               content: `Here's a preview of the new Join DM embed!\n${content || ''}`,
               embeds: [
                  JSON.parse(
                     await parsePlaceholders(auxdibot, JSON.stringify(embed), {
                        guild: interaction.data.guild,
                        member: interaction.data.member,
                     }),
                  ),
               ],
            });
         await setJoinDMEmbed(auxdibot, server.serverID, embed, content);
         const success = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
         success.title = 'Success!';
         success.description = `Set the Join DM embed.`;
         await auxdibot.createReply(interaction, { embeds: [success] });
      } catch (x) {
         return await handleError(auxdibot, 'EMBED_SEND_ERROR', 'There was an error sending that embed!', interaction);
      }
   },
};
