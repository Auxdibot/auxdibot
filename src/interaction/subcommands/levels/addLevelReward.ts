import Modules from '@/constants/bot/commands/Modules';
import Limits from '@/constants/database/Limits';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleError from '@/util/handleError';
import { testLimit } from '@/util/testLimit';
import { EmbedBuilder } from '@discordjs/builders';
import { PermissionsBitField } from 'discord.js';

export const addLevelReward = <AuxdibotSubcommand>{
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
      const reward = server.level_rewards.find((reward) => reward.roleID == role.id || reward.level == level);
      if (role.id == interaction.data.guild.roles.everyone.id) {
         return await handleError(auxdibot, 'LEVEL_REWARD_EVERYONE', 'This is the everyone role, silly!', interaction);
      }
      if (
         role &&
         interaction.memberPermissions &&
         interaction.data.member.id != interaction.data.guild.ownerId &&
         !interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) &&
         role.position >= interaction.data.member.roles.highest.position
      ) {
         return await handleError(
            auxdibot,
            'ROLE_POSITION_HIGHER',
            'This role has a higher position than your highest role!',
            interaction,
         );
      }
      if (
         role &&
         interaction.data.guild.members.me &&
         role.position >= interaction.data.guild.members.me.roles.highest.position
      ) {
         return await handleError(
            auxdibot,
            'ROLE_POSITION_HIGHER_BOT',
            "This role has a higher position than Auxdibot's highest role!",
            interaction,
         );
      }
      if (reward) {
         return await handleError(
            auxdibot,
            'LEVEL_REWARD_EXISTS',
            'This reward role already exists, or there is already a reward for that level!',
            interaction,
         );
      }
      if (!testLimit(server.level_rewards, Limits.LEVEL_REWARDS_DEFAULT_LIMIT)) {
         return await handleError(
            auxdibot,
            'LEVEL_REWARDS_LIMIT_EXCEEDED',
            'You have too many level rewards!',
            interaction,
         );
      }
      await auxdibot.database.servers.update({
         where: { serverID: server.serverID },
         data: { level_rewards: { push: { level, roleID: role.id } } },
      });

      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.description = `Successfully added <@&${role.id}> as a role reward!`;
      return await interaction.reply({ embeds: [embed] });
   },
};
