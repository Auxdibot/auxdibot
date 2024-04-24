import { Auxdibot } from '../../../../../interfaces/Auxdibot';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import Modules from '@/constants/bot/commands/Modules';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import { EmbedBuilder } from 'discord.js';
import handleError from '@/util/handleError';
import removeBlacklistedWord from '@/modules/features/moderation/blacklist/removeBlacklistedWord';

export const blacklistRemove = <AuxdibotSubcommand>{
   name: 'remove',
   group: 'blacklist',
   info: {
      module: Modules['Moderation'],
      description: 'Remove a blacklisted phrase from the server.',
      usageExample: '/moderation blacklist remove (phrase|index)',
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
      return removeBlacklistedWord(
         auxdibot,
         interaction.guild,
         interaction.user,
         server.automod_banned_phrases.indexOf(bannedPhrase),
      )
         .then(async () => {
            const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            successEmbed.title = '✅ Removed Blacklisted Phrase';
            successEmbed.description = `Removed "${bannedPhrase}" from the blacklisted phrases.`;
            return await auxdibot.createReply(interaction, { embeds: [successEmbed] });
         })
         .catch((x) => {
            return handleError(
               auxdibot,
               'ERROR_BLACKLIST_REMOVE',
               x?.message ?? "Couldn't remove that blacklisted phrase!",
               interaction,
            );
         });
   },
};
