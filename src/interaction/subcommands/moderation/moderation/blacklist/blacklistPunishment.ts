import { Auxdibot } from '../../../../../interfaces/Auxdibot';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import Modules from '@/constants/bot/commands/Modules';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import handleError from '@/util/handleError';
import { EmbedBuilder } from 'discord.js';
import { PunishmentType } from '@prisma/client';
import { PunishmentValues } from '@/constants/bot/punishments/PunishmentValues';

export const blacklistPunishment = <AuxdibotSubcommand>{
   name: 'punishment',
   group: 'blacklist',
   info: {
      module: Modules['Moderation'],
      description: 'Set the punishment given when a blacklisted word is used.',
      usageExample: '/moderation blacklist punishment (punishment)',
      permission: 'moderation.blacklist.punishment',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const punishment = interaction.options.getString('punishment', true);
      const server = interaction.data.guildData;
      if (server.automod_banned_phrases_punishment == punishment) {
         return await handleError(
            auxdibot,
            'PHRASE_ALREADY_BLACKLISTED',
            'That phrase is already blacklisted!',
            interaction,
         );
      }
      if (!PunishmentType[punishment]) {
         return await handleError(
            auxdibot,
            'INVALID_BLACKLIST_PUNISHMENT',
            'This is an invalid blacklist punishment type!',
            interaction,
         );
      }
      return auxdibot.database.servers
         .update({
            where: { serverID: server.serverID },
            data: { automod_banned_phrases_punishment: PunishmentType[punishment] },
         })
         .then(async () => {
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = 'Success!';
            embed.description = `Successfully set \`${PunishmentValues[punishment].name}\` as the server blacklist punishment.`;

            return await interaction.reply({ embeds: [embed] });
         })
         .catch(() => {
            handleError(
               auxdibot,
               'ERROR_BLACKLIST_PUNISHMENT',
               "Couldn't add that as the blacklist punishment!",
               interaction,
            );
         });
   },
};
