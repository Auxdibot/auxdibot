import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import { PunishmentNames } from '@/constants/PunishmentNames';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import Modules from '@/constants/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { punishmentInfoField } from '@/modules/features/moderation/punishmentInfoField';
import deletePunishment from '@/modules/features/moderation/deletePunishment';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';
import handleError from '@/util/handleError';

const punishmentCommand = <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('punishment')
      .setDescription('View a users punishment record.')
      .addSubcommand((subcommand) =>
         subcommand
            .setName('delete')
            .setDescription('Delete a punishment.')
            .addNumberOption((builder) =>
               builder.setName('punishment_id').setDescription('The ID of the punishment to delete.').setRequired(true),
            ),
      )
      .addSubcommand((subcommand) =>
         subcommand
            .setName('view')
            .setDescription('Get a punishment.')
            .addNumberOption((builder) =>
               builder.setName('punishment_id').setDescription('The ID of the punishment to view.').setRequired(true),
            ),
      )
      .addSubcommand((subcommand) => subcommand.setName('latest').setDescription('View the last 10 punishments.')),
   info: {
      module: Modules['Moderation'],
      description: 'View or delete a punishment.',
      usageExample: '/punishment [view|delete|latest]',
      permission: 'moderation.punishments',
   },
   subcommands: [
      {
         name: 'view',
         info: {
            module: Modules['Moderation'],
            description: 'View a punishment.',
            usageExample: '/punishment view (punishment_id)',
            permission: 'moderation.punishments.view',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const punishmentID = interaction.options.getNumber('punishment_id', true);
            const server = interaction.data.guildData;
            const punishment = server.punishments.filter((val) => val.punishmentID == punishmentID)[0];
            if (!punishment) {
               return await handleError(
                  auxdibot,
                  'PUNISHMENT_NOT_FOUND',
                  'This punishment does not exist!',
                  interaction,
               );
            }
            const type = PunishmentNames[punishment.type].name;
            const embed = new EmbedBuilder().setColor(auxdibot.colors.info).toJSON();
            embed.title = `${type} Information (PID: ${punishment.punishmentID})`;
            embed.description = `This is the punishment information for <@${punishment.userID}>`;
            embed.fields = [punishmentInfoField(punishment)];
            return await interaction.reply({ embeds: [embed] });
         },
      },
      {
         name: 'delete',
         info: {
            module: Modules['Moderation'],
            description: 'Delete a punishment.',
            usageExample: '/punishment delete (punishment_id)',
            permission: 'moderation.punishments.delete',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const punishment_id = interaction.options.getNumber('punishment_id', true);
            const server = interaction.data.guildData;
            const punishment = server.punishments.filter((val) => val.punishmentID == punishment_id)[0];
            if (!punishment) {
               return await handleError(
                  auxdibot,
                  'PUNISHMENT_NOT_FOUND',
                  'This punishment does not exist!',
                  interaction,
               );
            }

            deletePunishment(auxdibot, server.serverID, punishment_id);

            const type = PunishmentNames[punishment.type].name;
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = `${type} deleted. (PID: ${punishment.punishmentID})`;
            embed.description = `${interaction.user} deleted a punishment assigned to <@${punishment.userID}>.`;
            embed.fields = [punishmentInfoField(punishment)];
            await handleLog(
               auxdibot,
               interaction.data.guild,
               {
                  type: LogAction.PUNISHMENT_DELETED,
                  date_unix: Date.now(),
                  userID: interaction.user.id,
                  description: `${interaction.user.tag} deleted a punishment. (PID: ${punishment.punishmentID})`,
               },
               [punishmentInfoField(punishment)],
            );
            await interaction.reply({ embeds: [embed] });
         },
      },
      {
         name: 'latest',
         info: {
            module: Modules['Moderation'],
            description: 'View the last 10 punishments.',
            usageExample: '/punishment latest',
            permission: 'moderation.punishments.latest',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const server = interaction.data.guildData;
            const punishments = server.punishments.reverse().slice(0, 10);
            const embed = new EmbedBuilder().setColor(auxdibot.colors.default).toJSON();
            embed.title = '🔨 Latest Punishments';
            embed.fields = [
               {
                  name: `Latest Punishments on ${interaction.data.guild.name}`,
                  value: punishments.reduce((str, punishment) => {
                     const type = PunishmentNames[punishment.type];
                     return (
                        str +
                        `\n**${type.name}** - PID: ${punishment.punishmentID} - <t:${Math.round(
                           punishment.date_unix / 1000,
                        )}> (<@${punishment.userID}>)`
                     );
                  }, '\u2800'),
               },
            ];
            return await interaction.reply({ embeds: [embed] });
         },
      },
   ],
   async execute() {
      return;
   },
};
module.exports = punishmentCommand;
