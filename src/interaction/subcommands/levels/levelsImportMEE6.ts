import Modules from '@/constants/bot/commands/Modules';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { fetchFullMEE6LeaderboardPage } from '@/modules/features/levels/migration/MEE6';
import handleError from '@/util/handleError';
import createLevelReward from '@/modules/features/levels/createLevelReward';
import setMessageXP from '@/modules/features/levels/setMessageXP';
import { EmbedBuilder } from 'discord.js';
export default <AuxdibotSubcommand>{
   name: 'import_mee6',
   group: 'data',
   info: {
      module: Modules['Levels'],
      description: 'Import data from the MEE6 Discord app on your server.',
      usageExample: '/levels data import_mee6',
   },
   async execute(auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      await interaction.deferReply();
      const guild = interaction.options.getString('guildid_debug', true);
      try {
         const changes: string[] = [];
         const req = await fetchFullMEE6LeaderboardPage(guild);
         const { players, role_rewards, xp_per_message } = req;
         auxdibot.createReply(interaction, {
            embeds: [
               new EmbedBuilder()
                  .setTitle('MEE6 Data Retrieved')
                  .setColor(auxdibot.colors.info)
                  .setDescription(
                     `You will receive an update when your data is processed.\n\n${
                        players.length > 100
                           ? '⚠️ This dataset contains more than 100 users. This may take a long time. Be patient!'
                           : ''
                     }`,
                  ),
            ],
         });
         if (players.length > 0) {
            for (const p of players) {
               await auxdibot.database.servermembers
                  .upsert({
                     where: { serverID_userID: { serverID: guild, userID: p.id } },
                     create: {
                        serverID: interaction.guildId,
                        userID: p.id,
                        xp: p.xp,
                        level: p.level,
                     },
                     update: {
                        xp: p.xp,
                        level: p.level,
                     },
                  })
                  .catch((x) => {
                     console.error(x);
                     changes.push(`❌ Failed to import user <@${p.id}> from MEE6`);
                  });
            }
            changes.push(`✅ Imported ${players.length} users from MEE6`);
         }
         if (role_rewards.length > 0) {
            for (const r of role_rewards) {
               await createLevelReward(auxdibot, interaction.guild, interaction.user, r)
                  .then(() => {
                     changes.push(
                        `✅ Imported role reward for the role <@&${r.roleID}> and level ${r.level} from MEE6`,
                     );
                  })
                  .catch(() => {
                     changes.push(
                        `❌ Failed to import role reward for the role <@&${r.roleID}> and level ${r.level} from MEE6`,
                     );
                  });
            }
            changes.push(`✅ Imported ${role_rewards.length} role rewards from MEE6`);
         }
         if (xp_per_message) {
            await setMessageXP(auxdibot, interaction.guild, xp_per_message.slice(0, 2))
               .then(() => {
                  changes.push(
                     `✅ Imported message XP from MEE6 (${interaction.data.guildData.message_xp_range.join(
                        '-',
                     )} -> ${xp_per_message.join('-')})`,
                  );
               })
               .catch(() => {
                  changes.push(`❌ Failed to import message XP from MEE6`);
               });
         }
         const embed = new EmbedBuilder()
            .setTitle('MEE6 Data Imported')
            .setColor(auxdibot.colors.accept)
            .setDescription(changes.join('\n'));
         return auxdibot.createReply(interaction, { embeds: [embed] });
      } catch (x) {
         handleError(
            auxdibot,
            'MEE6_IMPORT_ERROR',
            'Failed to import level data from MEE6! This may be due to a couple of issues:\n\n* Rate limit reached.\n* MEE6 level data is not public. Leaderboard data needs to be public in order to import levels.\n* There was an issue contacting the MEE6 API.\nThere is no level data for this server.',
            interaction,
         );
      }
   },
};
