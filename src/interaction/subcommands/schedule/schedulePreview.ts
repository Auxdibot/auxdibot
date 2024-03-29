import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleError from '@/util/handleError';
import parsePlaceholders from '@/util/parsePlaceholder';
import { APIEmbed } from 'discord.js';

export const schedulePreview = <AuxdibotSubcommand>{
   name: 'preview',
   info: {
      module: Modules['Messages'],
      description: 'Preview a scheduled message.',
      usageExample: '/schedule preview [index]',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const index = interaction.options.getNumber('index');
      const server = interaction.data.guildData;
      if (!index) return await handleError(auxdibot, 'NO_INDEX', 'Please specify a valid index!', interaction);

      const schedule = server.scheduled_messages.find((_val, valIndex) => valIndex == index - 1);
      if (!schedule) {
         return await handleError(auxdibot, 'SCHEDULE_NOT_FOUND', "Couldn't find that schedule!", interaction);
      }
      return await auxdibot.createReply(interaction, {
         content: `${schedule.message || ''}`,
         ...(Object.entries(schedule.embed || {}).length != 0
            ? {
                 embeds: [
                    JSON.parse(
                       await parsePlaceholders(auxdibot, JSON.stringify(schedule.embed), interaction.guild),
                    ) as APIEmbed,
                 ],
              }
            : {}),
      });
   },
};
