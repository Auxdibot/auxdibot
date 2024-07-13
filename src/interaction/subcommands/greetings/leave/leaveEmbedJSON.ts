import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import setLeaveEmbed from '@/modules/features/greetings/setLeaveEmbed';
import handleError from '@/util/handleError';
import parsePlaceholders from '@/util/parsePlaceholder';
import { EmbedBuilder } from '@discordjs/builders';
import { APIEmbed } from '@prisma/client';

export const leaveEmbedJSON = <AuxdibotSubcommand>{
   name: 'embed_json',
   info: {
      module: Modules['Greetings'],
      description: 'Add an embed to the join message using custom JSON.',
      usageExample: '/leave embed_json (json)',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const json = interaction.options.getString('json', true);
      const server = interaction.data.guildData;
      try {
         const jsonEmbed = JSON.parse(json) as APIEmbed;
         if (interaction.channel && interaction.channel.isTextBased())
            await interaction.channel.send({
               content: "Here's a preview of the new leave embed!",
               ...(Object.entries(json || {}).length != 0
                  ? {
                       embeds: [
                          JSON.parse(
                             await parsePlaceholders(auxdibot, json, {
                                guild: interaction.data.guild,
                                member: interaction.data.member,
                             }),
                          ),
                       ],
                    }
                  : {}),
            });
         await setLeaveEmbed(auxdibot, server.serverID, jsonEmbed);
         const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
         embed.title = 'Success!';
         embed.description = `Set the leave embed.`;
         return await auxdibot.createReply(interaction, { embeds: [embed] });
      } catch (x) {
         return await handleError(
            auxdibot,
            'EMBED_SEND_ERROR_JSON',
            'There was an error sending that embed! (Most likely due to malformed JSON.)',
            interaction,
         );
      }
   },
};
