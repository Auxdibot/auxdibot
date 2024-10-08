import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import createLevelReward from '@/modules/features/levels/createLevelReward';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';
import { PermissionsBitField } from 'discord.js';

export const addLevelReward = <AuxdibotSubcommand>{
   name: 'add',
   group: 'rewards',
   info: {
      module: Modules['Levels'],
      description: 'Add a reward to the Level Rewards.',
      usageExample: '/levels rewards add (level) (role)',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const role = interaction.options.getRole('role', true),
         level = interaction.options.getNumber('level', true);
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
      createLevelReward(auxdibot, interaction.guild, interaction.user, { level, roleID: role.id })
         .then(async () => {
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = 'Success!';
            embed.description = `Successfully added <@&${role.id}> as a role reward!`;
            return await auxdibot.createReply(interaction, { embeds: [embed] });
         })
         .catch((x) => {
            handleError(
               auxdibot,
               'LEVEL_REWARD_ADD_ERROR',
               typeof x.message == 'string' ? x.message : "Couldn't add that level reward.",
               interaction,
            );
         });
   },
};
