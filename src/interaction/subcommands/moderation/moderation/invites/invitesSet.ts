import { Auxdibot } from '@/Auxdibot';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import Modules from '@/constants/bot/commands/Modules';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import handleError from '@/util/handleError';
import { EmbedBuilder } from 'discord.js';
import changeInvitesLimit from '@/modules/features/moderation/invites/changeInvitesLimit';

export const invitesSet = <AuxdibotSubcommand>{
   name: 'set',
   group: 'invites',
   info: {
      module: Modules['Moderation'],
      description: 'Set the invites spam limit for this server.',
      usageExample: '/moderation invites set (invites) (duration)',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const invites = interaction.options.getNumber('invites', true),
         duration = interaction.options.getNumber('duration', true);
      const server = interaction.data.guildData;
      if (
         server.automod_attachments_limit?.messages == invites &&
         server.automod_attachments_limit?.duration / 1000 == duration
      ) {
         return await handleError(
            auxdibot,
            'SETTINGS_IDENTICAL',
            'This is the same automod invites limit as you already have set!',
            interaction,
         );
      }
      if (duration > 120) {
         return await handleError(
            auxdibot,
            'DURATION_TOO_LONG',
            'You must specify a duration less than 2 minutes!',
            interaction,
         );
      }

      return changeInvitesLimit(
         auxdibot,
         interaction.guild,
         interaction.user,
         invites == 0 || duration == 0 ? null : { messages: invites, duration: duration * 1000 },
      )
         .then(async () => {
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = '⚙️ Automod Invites Limit Set';
            if (invites == 0) embed.description = 'Disabled invites filter.';
            else embed.description = `📩 Invites: \`${invites} invites\`\n🕰️ Spam Duration: \`${duration}s\``;
            return await auxdibot.createReply(interaction, { embeds: [embed] });
         })
         .catch(() => {
            handleError(auxdibot, 'ERROR_SET_INVITES_LIMIT', "Couldn't set the invites limit!", interaction);
         });
   },
};
