import { Auxdibot } from '../../../../../interfaces/Auxdibot';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import Modules from '@/constants/bot/commands/Modules';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import handleError from '@/util/handleError';
import { EmbedBuilder } from 'discord.js';
import { LogAction, PunishmentType } from '@prisma/client';
import { PunishmentValues } from '@/constants/bot/punishments/PunishmentValues';
import handleLog from '@/util/handleLog';

export const blacklistPunishment = <AuxdibotSubcommand>{
   name: 'punishment',
   group: 'blacklist',
   info: {
      module: Modules['Moderation'],
      description: 'Set the punishment given when a blacklisted word is used.',
      usageExample: '/moderation blacklist punishment (punishment)',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const punishment = interaction.options.getString('punishment', true);
      const server = interaction.data.guildData;
      if (server.automod_banned_phrases_punishment == punishment) {
         return await handleError(
            auxdibot,
            'PUNISHMENT_IDENTICAL',
            'That is the same punishment as the current automod blacklist punishment!',
            interaction,
         );
      }
      if (!PunishmentType[punishment]) {
         return await handleError(
            auxdibot,
            'INVALID_PUNISHMENT',
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
            await handleLog(auxdibot, interaction.data.guild, {
               userID: interaction.data.member.id,
               description: `The Automod blacklist punishment has been set to ${punishment}`,
               type: LogAction.AUTOMOD_SETTINGS_CHANGE,
               date: new Date(),
            });
            return await auxdibot.createReply(interaction, { embeds: [embed] });
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
