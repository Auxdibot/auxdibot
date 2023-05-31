import { EmbedBuilder, PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import { ILevelReward } from '@/mongo/schema/LevelRewardSchema';
import Modules from '@/config/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
const levelCommand = <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('levels')
      .setDescription('Change settings for leveling on this server.')
      .addSubcommand((builder) =>
         builder.setName('leaderboard').setDescription('View the leaderboard for this server.'),
      )
      .addSubcommand((builder) =>
         builder
            .setName('add_reward')
            .setDescription('Add a reward to the Level Rewards.')
            .addNumberOption((argBuilder) =>
               argBuilder.setName('level').setDescription('The level at which this reward is given.').setRequired(true),
            )
            .addRoleOption((argBuilder) =>
               argBuilder.setName('role').setDescription('The role that is given.').setRequired(true),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('remove_reward')
            .setDescription('Remove a reward from the Level Rewards.')
            .addNumberOption((argBuilder) =>
               argBuilder.setName('level').setDescription('The level at which this reward is given.').setRequired(true),
            ),
      )
      .addSubcommand((builder) => builder.setName('rewards').setDescription('View the Level Rewards for this server.'))
      .addSubcommand((builder) =>
         builder
            .setName('give_xp')
            .setDescription('Give a user XP points.')
            .addNumberOption((argBuilder) =>
               argBuilder.setName('xp').setDescription('How much XP is given.').setRequired(true),
            )
            .addUserOption((argBuilder) =>
               argBuilder.setName('user').setDescription('The user to give the XP to.').setRequired(true),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('remove_xp')
            .setDescription('Remove XP points from a user.')
            .addNumberOption((argBuilder) =>
               argBuilder.setName('xp').setDescription('How much XP is removed.').setRequired(true),
            )
            .addUserOption((argBuilder) =>
               argBuilder.setName('user').setDescription('The user to remove the XP from.').setRequired(true),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('reset')
            .setDescription("Reset a user's level and XP..")
            .addUserOption((argBuilder) =>
               argBuilder.setName('user').setDescription('The user to be reset.').setRequired(true),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('message_xp')
            .setDescription('Set the amount of XP given for sending a message.')
            .addNumberOption((argBuilder) =>
               argBuilder.setName('xp').setDescription('The amount of XP to give.').setRequired(true),
            ),
      ),
   info: {
      module: Modules['Levels'],
      description: 'Change settings for leveling on this server.',
      usageExample: '/levels (leaderboard|add_reward|rewards|remove_reward|give_xp|reset|remove_xp|message_xp)',
      permission: 'levels',
   },
   subcommands: [
      {
         name: 'leaderboard',
         info: {
            module: Modules['Levels'],
            description: 'View the top levelled members on this server.',
            usageExample: '/levels leaderboard',
            allowedDefault: true,
            permission: 'levels.leaderboard',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const server = interaction.data.guildData;
            const leaderboard = await server.createLeaderboard(20);
            const embed = new EmbedBuilder().setColor(auxdibot.colors.levels).toJSON();
            embed.title = '🎖️ Top Members';
            let placement = 0;
            embed.description = leaderboard.reduce((acc, _xp, member) => {
               placement++;
               return (
                  acc + `**${placement}**) <@${member.discord_id}> - \`Level ${member.level}\` (\`${member.xp} XP\`)\n`
               );
            }, '');
            return await interaction.reply({ embeds: [embed] });
         },
      },
      {
         name: 'add_reward',
         info: {
            module: Modules['Levels'],
            description: 'Add a reward to the Level Rewards.',
            usageExample: '/levels add_reward (level) (role)',
            permission: 'levels.rewards.add',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const role = interaction.options.getRole('role', true),
               level = interaction.options.getNumber('level', true);
            const server = interaction.data.guildData;
            const settings = await server.fetchSettings();
            const reward = settings.level_rewards.find((reward) => reward.role_id == role.id || reward.level == level);
            let embed = auxdibot.embeds.error.toJSON();
            if (role.id == interaction.data.guild.roles.everyone.id) {
               embed.description = 'This is the everyone role, silly!';
               return await interaction.reply({ embeds: [embed] });
            }
            if (
               role &&
               interaction.memberPermissions &&
               interaction.data.member.id != interaction.data.guild.ownerId &&
               !interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) &&
               role.position >= interaction.data.member.roles.highest.position
            ) {
               const errorEmbed = auxdibot.embeds.error.toJSON();
               errorEmbed.description = 'This role is higher than yours!';
               return await interaction.reply({ embeds: [errorEmbed] });
            }
            if (
               role &&
               interaction.data.guild.members.me &&
               role.position >= interaction.data.guild.members.me.roles.highest.position
            ) {
               const errorEmbed = auxdibot.embeds.error.toJSON();
               errorEmbed.description = "This role is higher than Auxdibot's highest role!";
               return await interaction.reply({ embeds: [errorEmbed] });
            }
            if (reward) {
               embed.description = 'This reward role already exists, or there is already a reward for that level!';
               return await interaction.reply({ embeds: [embed] });
            }
            const add_level_reward = await server.addLevelReward({ level, role_id: role.id });
            if ('error' in add_level_reward) {
               const errorEmbed = auxdibot.embeds.error.toJSON();
               errorEmbed.description = add_level_reward.error;
               return await interaction.reply({ embeds: [errorEmbed] });
            }
            embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.description = `Successfully added <@&${role.id}> as a role reward!`;
            return await interaction.reply({ embeds: [embed] });
         },
      },
      {
         name: 'remove_reward',
         info: {
            module: Modules['Levels'],
            description: 'Remove a reward from the Level Rewards.',
            usageExample: '/levels remove_reward (level)',
            permission: 'levels.rewards.remove',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const level = interaction.options.getNumber('level', true);
            const server = interaction.data.guildData;
            const settings = await server.fetchSettings();
            const reward = settings.level_rewards.find((reward) => reward.level == level);
            let embed = auxdibot.embeds.error.toJSON();
            if (!reward) {
               embed.description = "This reward role doesn't exist!";
               return await interaction.reply({ embeds: [embed] });
            }
            settings.level_rewards.splice(settings.level_rewards.indexOf(reward), 1);
            await settings.save({ validateBeforeSave: false });
            embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.description = `Successfully removed <@&${reward.role_id}> from the role rewards!`;
            return await interaction.reply({ embeds: [embed] });
         },
      },
      {
         name: 'rewards',
         info: {
            module: Modules['Levels'],
            description: 'View the Level Rewards for this server.',
            usageExample: '/levels rewards',
            permission: 'levels.rewards',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.info).toJSON();
            const settings = await interaction.data.guildData.fetchSettings();
            successEmbed.title = '🏆 Level Rewards';
            successEmbed.description = settings.level_rewards.reduce(
               (accumulator: string, value: ILevelReward, index: number) =>
                  `${accumulator}\n**${index + 1})** <@&${value.role_id}> (\`Level ${value.level}\`)`,
               '',
            );
            return await interaction.reply({ embeds: [successEmbed] });
         },
      },
      {
         name: 'reset',
         info: {
            module: Modules['Levels'],
            description: "Reset a user's level and XP.",
            usageExample: '/levels reset (user)',
            permission: 'levels.xp.reset',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const user = interaction.options.getUser('user', true);
            const member = interaction.data.guild.members.cache.get(user.id);
            let embed = auxdibot.embeds.error.toJSON();
            if (!member) {
               embed.description = "This person isn't on the server!";
               return await interaction.reply({ embeds: [embed] });
            }
            const data = await interaction.data.guildData.findOrCreateMember(member.id);
            if (data) {
               (data.xp = 0), (data.level = 0), (data.xpTill = 0);
               await data.save();
            }
            embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.description = `Successfully reset ${member}'s Level and XP.`;
            embed.title = 'Success!';
            return await interaction.reply({ embeds: [embed] });
         },
      },
      {
         name: 'give_xp',
         info: {
            module: Modules['Levels'],
            description: 'Give a user XP points.',
            usageExample: '/levels give_xp (xp) (user)',
            permission: 'levels.xp.give',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const xp = interaction.options.getNumber('xp', true),
               user = interaction.options.getUser('user', true);
            const member = interaction.data.guild.members.cache.get(user.id);
            let embed = auxdibot.embeds.error.toJSON();
            if (!member) {
               embed.description = "This person isn't on the server!";
               return await interaction.reply({ embeds: [embed] });
            }
            const data = await interaction.data.guildData.findOrCreateMember(member.id);
            if (data) {
               data.addXP(xp);
               await data.save();
            }
            embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.description = `Successfully gave ${member} ${xp.toLocaleString()} XP.`;
            embed.title = 'Success!';
            return await interaction.reply({ embeds: [embed] });
         },
      },
      {
         name: 'remove_xp',
         info: {
            module: Modules['Levels'],
            help: {
               commandCategory: 'Levels',
               name: '/levels remove_xp',
               description: 'Remove XP points from a user.',
               usageExample: '/levels remove_exp (xp) (user)',
            },
            permission: 'levels.xp.remove',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const xp = interaction.options.getNumber('xp', true),
               user = interaction.options.getUser('user', true);
            const member = interaction.data.guild.members.cache.get(user.id);
            let embed = auxdibot.embeds.error.toJSON();
            if (!member) {
               embed.description = "This person isn't on the server!";
               return await interaction.reply({ embeds: [embed] });
            }
            const data = await interaction.data.guildData.findOrCreateMember(member.id);
            if (data) {
               data.takeXP(xp);
               await data.save();
            }
            embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.description = `Successfully took ${xp.toLocaleString()} XP from ${member}.`;
            embed.title = 'Success!';
            return await interaction.reply({ embeds: [embed] });
         },
      },
      {
         name: 'message_xp',
         info: {
            module: Modules['Levels'],
            description: 'Set the amount of XP given for sending a message.',
            usageExample: '/levels message_xp (xp)',
            permission: 'levels.message_xp',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const xp = interaction.options.getNumber('xp', true);
            const settings = await interaction.data.guildData.fetchSettings();
            settings.message_xp = xp;
            await settings.save();
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.description = `Members will now get ${xp.toLocaleString()} XP from chatting.`;
            embed.title = 'Success!';
            return await interaction.reply({ embeds: [embed] });
         },
      },
   ],
   async execute() {
      return;
   },
};
module.exports = levelCommand;
