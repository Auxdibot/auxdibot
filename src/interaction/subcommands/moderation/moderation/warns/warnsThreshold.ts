import { Auxdibot } from '../../../../../interfaces/Auxdibot';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import Modules from '@/constants/bot/commands/Modules';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import handleError from '@/util/handleError';
import { EmbedBuilder } from 'discord.js';
import { PunishmentType } from '@prisma/client';
import { PunishmentValues } from '@/constants/bot/punishments/PunishmentValues';

export const warnsThreshold = <AuxdibotSubcommand>{
   name: 'threshold',
   group: 'warns',
   info: {
      module: Modules['Moderation'],
      description: 'Set the punishment to give for receiving warns on your server. (set warns to 0 to disable)',
      usageExample: '/moderation warns threshold (punishment) (warns)',
      permission: 'moderation.warns.threshold',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const punishment = interaction.options.getString('punishment', true),
         warns = interaction.options.getNumber('warns', true);
      const server = interaction.data.guildData;
      if (!PunishmentType[punishment]) {
         return await handleError(
            auxdibot,
            'INVALID_BLACKLIST_PUNISHMENT',
            'This is an invalid threshold punishment type!',
            interaction,
         );
      }
      return auxdibot.database.servers
         .update({
            where: { serverID: server.serverID },
            data: { automod_punish_threshold_warns: warns, automod_threshold_punishment: PunishmentType[punishment] },
         })
         .then(async () => {
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = 'Success!';
            embed.description = `Successfully set \`${PunishmentValues[punishment].name}\` as the server warn threshold punishment. Once a user hits ${warns} warns, they will be ${PunishmentValues[punishment].action}.`;

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
