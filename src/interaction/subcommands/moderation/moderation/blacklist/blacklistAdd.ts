import { Auxdibot } from './../../../../../interfaces/Auxdibot';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import Modules from '@/constants/bot/commands/Modules';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import { testLimit } from '@/util/testLimit';
import Limits from '@/constants/database/Limits';
import handleError from '@/util/handleError';
import { EmbedBuilder } from 'discord.js';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';

export const blacklistAdd = <AuxdibotSubcommand>{
   name: 'add',
   group: 'blacklist',
   info: {
      module: Modules['Moderation'],
      description: 'Add a blacklisted word to this server.',
      usageExample: '/moderation blacklist add (phrase)',
      permission: 'moderation.blacklist.add',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const phrase = interaction.options.getString('phrase', true);
      const server = interaction.data.guildData;
      if (!testLimit(server.automod_banned_phrases, Limits.AUTOMOD_BLACKLIST_LIMIT)) {
         return await handleError(
            auxdibot,
            'BLACKLIST_LIMIT_REACHED',
            'You have too many blacklisted phrases!',
            interaction,
         );
      }
      if (server.automod_banned_phrases.indexOf(phrase) != -1) {
         return await handleError(
            auxdibot,
            'PHRASE_ALREADY_BLACKLISTED',
            'That phrase is already blacklisted!',
            interaction,
         );
      }
      return auxdibot.database.servers
         .update({ where: { serverID: server.serverID }, data: { automod_banned_phrases: { push: phrase } } })
         .then(async () => {
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = 'Success!';
            embed.description = `Successfully added \`${phrase}\` to the server blacklist.`;
            await handleLog(auxdibot, interaction.data.guild, {
               userID: interaction.data.member.id,
               description: `Added "${phrase}" as a blacklisted phrase.`,
               type: LogAction.AUTOMOD_SETTINGS_CHANGE,
               date_unix: Date.now(),
            });
            return await interaction.reply({ embeds: [embed] });
         })
         .catch(() => {
            handleError(auxdibot, 'ERROR_BLACKLIST_ADD', "Couldn't add that phrase to the blacklist!", interaction);
         });
   },
};
