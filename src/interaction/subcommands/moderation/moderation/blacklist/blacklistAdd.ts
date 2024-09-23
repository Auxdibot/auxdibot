import { Auxdibot } from '@/Auxdibot';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import Modules from '@/constants/bot/commands/Modules';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import handleError from '@/util/handleError';
import { EmbedBuilder } from 'discord.js';
import addBlacklistedPhrase from '@/modules/features/moderation/blacklist/addBlacklistedPhrase';

export const blacklistAdd = <AuxdibotSubcommand>{
   name: 'add',
   group: 'blacklist',
   info: {
      module: Modules['Moderation'],
      description: 'Add a blacklisted word to this server.',
      usageExample: '/moderation blacklist add (phrase)',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const phrase = interaction.options.getString('phrase', true);

      return addBlacklistedPhrase(auxdibot, interaction.guild, interaction.user, phrase)
         .then(async () => {
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = 'Success!';
            embed.description = `Successfully added \`${phrase}\` to the server blacklist.`;
            return await auxdibot.createReply(interaction, { embeds: [embed] });
         })
         .catch((x) => {
            handleError(
               auxdibot,
               'ERROR_BLACKLIST_ADD',
               x?.message ?? "Couldn't add that phrase to the blacklist!",
               interaction,
            );
         });
   },
};
