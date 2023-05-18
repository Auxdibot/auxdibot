import { SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@util/templates/AuxdibotCommand';
import Embeds from '@util/constants/Embeds';
import { PunishmentNames, toEmbedField } from '@schemas/PunishmentSchema';
import AuxdibotCommandInteraction from '@util/templates/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@util/types/AuxdibotCommandData';
import { LogType } from '@util/types/Log';

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
      help: {
         commandCategory: 'Moderation',
         name: '/punishment',
         description: 'View or delete a punishment.',
         usageExample: '/punishment [view|delete|latest]',
      },
      permission: 'moderation.punishments',
   },
   subcommands: [
      {
         name: 'view',
         info: {
            help: {
               commandCategory: 'Moderation',
               name: '/punishment view',
               description: 'View a punishment.',
               usageExample: '/punishment view (punishment_id)',
            },
            permission: 'moderation.punishments.view',
         },
         async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const punishment_id = interaction.options.getNumber('punishment_id', true);
            const data = await interaction.data.guildData.fetchData();
            const punishment = data.punishments.filter((val) => val.punishment_id == punishment_id)[0];
            if (!punishment) {
               const errorEmbed = Embeds.ERROR_EMBED.toJSON();
               errorEmbed.description = 'This punishment does not exist!';
               return await interaction.reply({ embeds: [errorEmbed] });
            }
            const type = PunishmentNames[punishment.type].name;
            const embed = Embeds.INFO_EMBED.toJSON();
            embed.title = `${type} Information (PID: ${punishment.punishment_id})`;
            embed.description = `This is the punishment information for <@${punishment.user_id}>`;
            embed.fields = [toEmbedField(punishment)];
            return await interaction.reply({ embeds: [embed] });
         },
      },
      {
         name: 'delete',
         info: {
            help: {
               commandCategory: 'Moderation',
               name: '/punishment delete',
               description: 'Delete a punishment.',
               usageExample: '/punishment delete (punishment_id)',
            },
            permission: 'moderation.punishments.delete',
         },
         async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const punishment_id = interaction.options.getNumber('punishment_id', true);
            const data = await interaction.data.guildData.fetchData();
            const punishment = data.punishments.filter((val) => val.punishment_id == punishment_id)[0];
            if (!punishment) {
               const errorEmbed = Embeds.ERROR_EMBED.toJSON();
               errorEmbed.description = 'This punishment does not exist!';
               return await interaction.reply({ embeds: [errorEmbed] });
            }
            const type = PunishmentNames[punishment.type].name;
            data.punishments.splice(data.punishments.indexOf(punishment), 1);
            await interaction.data.guildData.save();
            const embed = Embeds.SUCCESS_EMBED.toJSON();
            embed.title = `${type} deleted. (PID: ${punishment.punishment_id})`;
            embed.description = `${interaction.user} deleted a punishment assigned to <@${punishment.user_id}>.`;
            embed.fields = [toEmbedField(punishment)];
            await interaction.data.guildData.log({
               type: LogType.PUNISHMENT_DELETED,
               punishment: punishment,
               date_unix: Date.now(),
               user_id: interaction.user.id,
               description: `${interaction.user.tag} deleted a punishment. (PID: ${punishment.punishment_id})`,
            });
            await interaction.reply({ embeds: [embed] });
         },
      },
      {
         name: 'latest',
         info: {
            help: {
               commandCategory: 'Moderation',
               name: '/punishment latest',
               description: 'View the last 10 punishments.',
               usageExample: '/punishment latest',
            },
            permission: 'moderation.punishments.latest',
         },
         async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const data = await interaction.data.guildData.fetchData();
            const punishments = data.punishments.reverse().slice(0, 10);
            const embed = Embeds.DEFAULT_EMBED.toJSON();
            embed.title = '🔨 Latest Punishments';
            embed.fields = [
               {
                  name: `Latest Punishments on ${interaction.data.guild.name}`,
                  value: punishments.reduce((str, punishment) => {
                     const type = PunishmentNames[punishment.type];
                     return (
                        str +
                        `\n**${type.name}** - PID: ${punishment.punishment_id} - <t:${Math.round(
                           punishment.date_unix / 1000,
                        )}> (<@${punishment.user_id}>)`
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
