import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';
import handleError from '@/util/handleError';

const massroleCommand = <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('massrole')
      .setDescription('Give everybody a role, or take a role away from anyone that has it.')
      .addSubcommand((builder) =>
         builder
            .setName('give')
            .setDescription('Give everybody a role.')
            .addRoleOption((argBuilder) =>
               argBuilder.setName('role').setDescription('The role to be given.').setRequired(true),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('take')
            .setDescription('Take away a role from everybody.')
            .addRoleOption((argBuilder) =>
               argBuilder.setName('role').setDescription('The role to be taken away.').setRequired(true),
            ),
      ),
   info: {
      module: Modules['Roles'],
      description: 'Give everybody a role, or take a role away from anyone that has it.',
      usageExample: '/massrole (give|take)',
      permission: 'massrole',
   },
   subcommands: [
      {
         name: 'give',
         info: {
            module: Modules['Roles'],
            description: 'Give everybody a role.',
            usageExample: '/massrole give (role)',
            permission: 'massrole.give',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const role = interaction.options.getRole('role', true);

            if (role.position >= interaction.data.member.roles.highest.position) {
               return await handleError(
                  auxdibot,
                  'ROLE_POSITION_HIGHER',
                  'This role has a higher or equal position than your highest role!',
                  interaction,
               );
            }
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = 'Success!';
            embed.description = `Currently giving the role...`;
            await interaction.reply({ embeds: [embed] });
            const res = await interaction.data.guild.members.fetch();
            res.forEach((member) => {
               if (
                  interaction.data.member.id != member.id &&
                  (!member.roles.resolve(role.id) &&
                     interaction.data.guild.members.me &&
                     member.roles.highest.comparePositionTo(interaction.data.guild.members.me.roles.highest) <= 0 &&
                     member.roles.highest.comparePositionTo(interaction.data.member.roles.highest)) <= 0
               ) {
                  member.roles.add(role.id).catch(() => undefined);
               }
            });
            handleLog(auxdibot, interaction.data.guild, {
               userID: interaction.data.member.id,
               description: `Massrole took ${role} from anyone who had it, with lower role hiearchy than Auxdibot.`,
               type: LogAction.MASSROLE_GIVEN,
               date_unix: Date.now(),
            });
         },
      },
      {
         name: 'take',
         info: {
            module: Modules['Roles'],
            description: 'Take away a role from every user.',
            usageExample: '/massrole take (role)',
            permission: 'massrole.take',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const role = interaction.options.getRole('role', true);
            if (role.position >= interaction.data.member.roles.highest.position) {
               return await handleError(
                  auxdibot,
                  'ROLE_POSITION_HIGHER',
                  'This role has a higher or equal position than your highest role!',
                  interaction,
               );
            }
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = 'Success!';
            embed.description = `Currently removing the role...`;
            await interaction.reply({ embeds: [embed] });
            const res = await interaction.data.guild.members.fetch();
            res.forEach((member) => {
               if (!interaction.data) return;
               if (
                  interaction.data.member.id != member.id &&
                  (!member.roles.resolve(role.id) &&
                     interaction.data.guild.members.me &&
                     member.roles.highest.comparePositionTo(interaction.data.guild.members.me.roles.highest) <= 0 &&
                     member.roles.highest.comparePositionTo(interaction.data.member.roles.highest)) <= 0
               ) {
                  member.roles.remove(role.id).catch(() => undefined);
               }
            });
            handleLog(auxdibot, interaction.data.guild, {
               userID: interaction.data.member.id,
               description: `Massrole took ${role} from anyone who had it, with lower role hiearchy than Auxdibot.`,
               type: LogAction.MASSROLE_TAKEN,
               date_unix: Date.now(),
            });
         },
      },
   ],
   async execute() {
      return;
   },
};
module.exports = massroleCommand;
