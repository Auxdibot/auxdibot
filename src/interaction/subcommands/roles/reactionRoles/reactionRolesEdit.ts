import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { toAPIEmbed } from '@/util/toAPIEmbed';
import argumentsToEmbedParameters from '@/util/argumentsToEmbedParameters';
import { getMessage } from '@/util/getMessage';
import handleError from '@/util/handleError';
import handleLog from '@/util/handleLog';
import parsePlaceholders from '@/util/parsePlaceholder';
import { EmbedBuilder } from '@discordjs/builders';
import { LogAction } from '@prisma/client';

export const reactionRolesEdit = <AuxdibotSubcommand>{
   name: 'edit',
   info: {
      module: Modules['Roles'],
      description: "Edit a reaction role's embed on this server.",
      usageExample:
         '/reaction_roles edit [message_id] [index] [json, overrides embed parameters] [...embed parameters]',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const messageID = interaction.options.getString('message_id'),
         index = interaction.options.getNumber('index'),
         json = interaction.options.getString('json'),
         content = interaction.options.getString('content');
      const server = interaction.data.guildData;
      if (!messageID && !index)
         return await handleError(auxdibot, 'NO_ID_OR_INDEX', 'Please specify a valid ID OR index!', interaction);
      const rr = server.reaction_roles.find((val, valIndex) =>
         messageID ? val.messageID == messageID : index ? valIndex == index - 1 : undefined,
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
      if (!message) {
         server.reaction_roles.splice(server.reaction_roles.indexOf(rr), 1);
         await auxdibot.database.servers.update({
            where: { serverID: server.serverID },
            data: { reaction_roles: server.reaction_roles },
         });
         return await handleError(
            auxdibot,
            'REACTION_ROLE_NO_MESSAGE',
            'No message for the reaction role found!',
            interaction,
         );
      }
      if (json) {
         const messageEdit = await message
            .edit({
               ...(content ? { content } : {}),
               embeds: [
                  JSON.parse(
                     await parsePlaceholders(auxdibot, json || '', {
                        guild: interaction.data.guild,
                        member: interaction.data.member,
                     }),
                  ),
               ],
            })
            .catch(() => undefined);
         if (!messageEdit) {
            return await handleError(
               auxdibot,
               'EMBED_SEND_ERROR',
               'There was an error sending that embed!',
               interaction,
            );
         }
         const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
         embed.title = '👈 Edited Reaction Role';
         embed.description = `Edited a reaction role${message ? ` in ${message.channel}` : ''}.`;
         await handleLog(auxdibot, interaction.data.guild, {
            userID: interaction.data.member.id,
            description: `${interaction.data.member.user.username} edited reaction role #${
               server.reaction_roles.indexOf(rr) == -1 ? 'Unknown' : server.reaction_roles.indexOf(rr)
            }.`,
            type: LogAction.REACTION_ROLE_EDITED,
            date: new Date(),
         });
         return await auxdibot.createReply(interaction, { embeds: [embed] });
      }

      try {
         const parameters = argumentsToEmbedParameters(interaction);
         const messageEdit = await message
            .edit({
               ...(content ? { content } : {}),
               embeds: [
                  toAPIEmbed(
                     JSON.parse(
                        await parsePlaceholders(auxdibot, JSON.stringify(parameters), {
                           guild: interaction.data.guild,
                           member: interaction.data.member,
                        }),
                     ),
                  ),
               ],
            })
            .catch(() => undefined);
         if (!messageEdit) {
            return await handleError(
               auxdibot,
               'EMBED_SEND_ERROR',
               'There was an error sending that embed!',
               interaction,
            );
         }
         const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
         embed.title = '👈 Edited Reaction Role';
         embed.description = `Edited a reaction role${message ? ` in ${message.channel}` : ''}.`;
         handleLog(auxdibot, interaction.data.guild, {
            userID: interaction.data.member.id,
            description: `${interaction.data.member.user.username} edited reaction role #${
               server.reaction_roles.indexOf(rr) == -1 ? 'Unknown' : server.reaction_roles.indexOf(rr)
            }.`,
            type: LogAction.REACTION_ROLE_EDITED,
            date: new Date(),
         });
         return await auxdibot.createReply(interaction, { embeds: [embed] });
      } catch (x) {
         return await handleError(auxdibot, 'EMBED_SEND_ERROR', 'There was an error sending that embed!', interaction);
      }
   },
};
