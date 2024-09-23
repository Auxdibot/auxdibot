import Modules from '@/constants/bot/commands/Modules';
import { DEFAULT_LEVELUP_EMBED } from '@/constants/embeds/DefaultEmbeds';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import setLevelMessage from '@/modules/features/levels/setLevelMessage';
import handleError from '@/util/handleError';
import parsePlaceholders from '@/util/parsePlaceholder';
import { EmbedBuilder } from 'discord.js';

export const levelReset = <AuxdibotSubcommand>{
   name: 'reset',
   group: 'message',
   info: {
      module: Modules['Levels'],
      description: 'Reset the levelup message back to its default value.',
      usageExample: '/level message reset',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const server = interaction.data.guildData;

      try {
         if (interaction.channel && interaction.channel.isTextBased())
            await interaction.channel.send({
               content: `Here's a preview of the new levelup message!`,
               embeds: [
                  JSON.parse(
                     await parsePlaceholders(auxdibot, JSON.stringify(DEFAULT_LEVELUP_EMBED), {
                        guild: interaction.data.guild,
                        member: interaction.data.member,
                        levelup: { from: 0, to: 1 },
                     }),
                  ),
               ],
            });
         await setLevelMessage(
            auxdibot,
            server.serverID,
            {
               ...DEFAULT_LEVELUP_EMBED,
               url: '',
               author: {
                  icon_url: DEFAULT_LEVELUP_EMBED.author.icon_url,
                  name: DEFAULT_LEVELUP_EMBED.author.name,
                  proxy_icon_url: null,
                  url: null,
               },
               fields: [],
               footer: { icon_url: null, proxy_icon_url: null, text: '' },
               thumbnail: { height: null, proxy_url: null, url: '', width: null },
               image: { height: null, proxy_url: null, url: '', width: null },
            },
            '',
         );
         const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
         embed.title = 'Success!';
         embed.description = `Set the levelup message.`;
         await auxdibot.createReply(interaction, { embeds: [embed] });
      } catch (x) {
         return await handleError(auxdibot, 'EMBED_SEND_ERROR', 'There was an error sending that embed!', interaction);
      }
      return;
   },
};
