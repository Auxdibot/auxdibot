import { Auxdibot } from '../../../../../interfaces/Auxdibot';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import Modules from '@/constants/bot/commands/Modules';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import { EmbedBuilder } from 'discord.js';
import handleError from '@/util/handleError';
import { LogAction } from '@prisma/client';
import handleLog from '@/util/handleLog';

export const blacklistRemove = <AuxdibotSubcommand>{
   name: 'remove',
   group: 'blacklist',
   info: {
      module: Modules['Moderation'],
      description: 'Remove a blacklisted phrase from the server.',
      usageExample: '/moderation blacklist remove (phrase or index)',
      permission: 'moderation.blacklist.remove',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data || !interaction.memberPermissions) return;
      const phrase = interaction.options.getString('phrase'),
         index = interaction.options.getNumber('index');
      const server = interaction.data.guildData;
      const bannedPhrase =
         phrase != null
            ? server.automod_banned_phrases.find((val: string) => phrase == val)
            : index
            ? server.automod_banned_phrases[index - 1]
            : undefined;

      if (!bannedPhrase) {
         return await handleError(
            auxdibot,
            'BLACKLISTED_PHRASE_NOT_FOUND',
            "Couldn't find that blacklisted phrase!",
            interaction,
         );
      }
      server.automod_banned_phrases.splice(server.automod_banned_phrases.indexOf(bannedPhrase), 1);
      await auxdibot.database.servers.update({
         where: { serverID: server.serverID },
         data: { automod_banned_phrases: server.automod_banned_phrases },
      });
      const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      successEmbed.title = '✅ Removed Blacklisted Phrase';
      successEmbed.description = `Removed "${bannedPhrase}" from the blacklisted phrases.`;
      await handleLog(auxdibot, interaction.data.guild, {
         userID: interaction.data.member.id,
         description: `Removed "${bannedPhrase}" from the blacklisted phrases.`,
         type: LogAction.AUTOMOD_SETTINGS_CHANGE,
         date_unix: Date.now(),
      });
      return await interaction.reply({ embeds: [successEmbed] });
   },
};
