import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import addReactionRole from '@/modules/features/reaction_roles/addReactionRole';
import handleError from '@/util/handleError';
import parsePlaceholders from '@/util/parsePlaceholder';
import { EmbedBuilder } from '@discordjs/builders';
import { APIEmbed } from '@prisma/client';
import { ChannelType } from 'discord.js';

export const reactionRolesAddJSON = <AuxdibotSubcommand>{
   name: 'add_json',
   info: {
      module: Modules['Roles'],
      description: 'Add a reaction role to the server with custom Discord Embed JSON.',
      usageExample: '/reaction_roles add_json (channel) (roles) (json)',
      permission: 'rr.add.json',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const channel = interaction.options.getChannel('channel', true, [ChannelType.GuildText]),
         roles = interaction.options.getString('roles', true),
         json = interaction.options.getString('json', true);
      const split = roles.split(' ');
      const builder = [];
      while (split.length) {
         const [emoji, roleID] = split.splice(0, 2);
         builder.push({ emoji, roleID });
      }
      const embed = JSON.parse(
         await parsePlaceholders(auxdibot, json || '', interaction.data.guild, interaction.data.member),
      ) satisfies APIEmbed;
      addReactionRole(auxdibot, interaction.guild, channel, embed.title, builder, embed)
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
