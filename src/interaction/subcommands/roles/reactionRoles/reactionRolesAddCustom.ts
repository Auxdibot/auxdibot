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
import addReactionRole from '@/modules/features/reaction_roles/addReactionRole';

export const reactionRolesAddCustom = <AuxdibotSubcommand>{
   name: 'add_custom',
   info: {
      module: Modules['Roles'],
      description: 'Add a reaction role to the server with custom Embed parameters.',
      usageExample:
         '/reaction_roles add_custom (channel) (roles) [content] [color] [title] [title url] [author] [author icon url] [author url] [description] [fields (split title and description with `"|d|"`, and seperate fields with `"|s|"`)] [footer] [footer icon url] [image url] [thumbnail url]',
      permission: 'rr.add.custom',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const channel = interaction.options.getChannel('channel', true, [ChannelType.GuildText]),
         roles = interaction.options.getString('roles', true),
         content = interaction.options.getString('content')?.replace(/\\n/g, '\n') || '';
      const split = roles.split(' ');
      const builder = [];
      while (split.length) {
         const [emoji, roleID] = split.splice(0, 2);
         builder.push({ emoji, roleID });
      }
      const parameters = argumentsToEmbedParameters(interaction);
      addReactionRole(
         auxdibot,
         interaction.guild,
         channel,
         parameters.title,
         builder,
         toAPIEmbed(
            JSON.parse(
               await parsePlaceholders(
                  auxdibot,
                  JSON.stringify(parameters),
                  interaction.data.guild,
                  interaction.data.member,
               ),
            ),
         ),
         content,
      )
         .then(async () => {
            const resEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            resEmbed.title = '👈 Created Reaction Role';
            resEmbed.description = `Created a reaction role in ${channel}`;
            return await interaction.reply({ embeds: [resEmbed] });
         })
         .catch(async (x) => {
            handleError(
               auxdibot,
               'REACTION_ROLE_CREATE_ERROR',
               typeof x.message == 'string' ? x.message : "Couldn't delete that permission override!",
               interaction,
            );
         });
   },
};
