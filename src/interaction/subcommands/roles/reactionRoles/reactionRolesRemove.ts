import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import removeReactionRole from '@/modules/features/roles/reaction_roles/removeReactionRole';
import { getMessage } from '@/util/getMessage';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';

export const reactionRolesRemove = <AuxdibotSubcommand>{
   name: 'remove',
   info: {
      module: Modules['Roles'],
      description: 'Remove a role that is assigned when a member joins the server.',
      usageExample: '/reaction_roles remove [message_id] [index]',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const message_id = interaction.options.getString('message_id'),
         index = interaction.options.getNumber('index');
      const server = interaction.data.guildData;
      if (!message_id && !index)
         return await handleError(auxdibot, 'NO_ID_OR_INDEX', 'Please specify a valid ID OR index!', interaction);

      const rr = server.reaction_roles.find((val, valIndex) =>
         message_id ? val.messageID == message_id : index ? valIndex == index - 1 : undefined,
      );
      if (!rr) {
         return await handleError(
            auxdibot,
            'REACTION_ROLE_NOT_FOUND',
            "Couldn't find that reaction role!",
            interaction,
         );
      }
      const message_channel = rr.channelID ? interaction.data.guild.channels.cache.get(rr.channelID) : undefined;
      const message =
         message_channel && message_channel.isTextBased()
            ? message_channel.messages.cache.get(rr.messageID)
            : await getMessage(interaction.data.guild, rr.messageID);
      removeReactionRole(auxdibot, interaction.guild, server.reaction_roles.indexOf(rr), interaction.user)
         .then(async () => {
            const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            successEmbed.title = '👈 Deleted Reaction Role';
            successEmbed.description = `Deleted a reaction role${message ? ` in ${message.channel}` : ''}.`;
            return await auxdibot.createReply(interaction, { embeds: [successEmbed] });
         })
         .catch((x) =>
            handleError(
               auxdibot,
               'REACTION_ROLE_DELETE_ERROR',
               typeof x.message == 'string' ? x.message : "Couldn't delete that reaction role!",
               interaction,
            ),
         );
   },
};
