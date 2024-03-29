import { CustomEmojis } from '@/constants/bot/CustomEmojis';
import Modules from '@/constants/bot/commands/Modules';
import { promoRow } from '@/constants/bot/promoRow';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { DMAuxdibotCommandData, GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { EmbedBuilder } from '@discordjs/builders';
import { ActionRowBuilder, ButtonBuilder } from 'discord.js';

export const helpAll = <AuxdibotSubcommand>{
   name: 'all',
   info: {
      module: Modules['General'],
      description: "View Auxdibot's help menu, containing all the information you need to know.",
      usageExample: '/help all',
      allowedDefault: true,
      dmableCommand: true,
   },
   async execute(
      auxdibot: Auxdibot,
      interaction: AuxdibotCommandInteraction<DMAuxdibotCommandData | GuildAuxdibotCommandData>,
   ) {
      const embed = new EmbedBuilder().setColor(auxdibot.colors.default).toJSON();
      embed.title = `${CustomEmojis.HELP} Auxdibot Help Menu`;
      embed.description = `Welcome to ${CustomEmojis.AUXDIBOT} Auxdibot's interactive Help Menu! You can view a brief summary and usage explanation of every module below, or go to our website or support server using the buttons down below!`;
      embed.fields = [
         {
            name: 'What is Auxdibot?',
            value: 'Auxdibot is a Discord bot project founded and maintained by Auxdible. Auxdibot features a wide variety of features for admins to manage their servers with. Auxdibot receives consistant updates and constant bug fixes, making it a reliable choice for your server!',
         },
         {
            name: 'How do I navigate?',
            value: 'You can navigate this help menu by clicking on one of the buttons on this embed, representing the different modules.',
            inline: true,
         },
         {
            name: "Don't like a module?",
            value: "Look at the `/modules disable` and `/modules enable` commands to disable or enable a specific module's functionality.",
            inline: true,
         },
      ];
      embed.thumbnail = {
         url: `${process.env.BOT_HOMEPAGE}/logo.png`,
      };
      const modulesRow1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
               .setStyle(1)
               .setCustomId('module-general')
               .setLabel('General')
               .setEmoji(CustomEmojis.AUXDIBOT),
            new ButtonBuilder()
               .setStyle(1)
               .setCustomId('module-settings')
               .setLabel('Settings')
               .setEmoji(CustomEmojis.BOLT),
            new ButtonBuilder()
               .setStyle(1)
               .setCustomId('module-moderation')
               .setLabel('Moderation')
               .setEmoji(CustomEmojis.MODERATION),
            new ButtonBuilder()
               .setStyle(1)
               .setCustomId('module-permissions')
               .setLabel('Permissions')
               .setEmoji(CustomEmojis.PERMISSIONS),
            new ButtonBuilder()
               .setStyle(1)
               .setCustomId('module-messages')
               .setLabel('Messages')
               .setEmoji(CustomEmojis.MESSAGES),
         ),
         modulesRow2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
               .setStyle(1)
               .setCustomId('module-greetings')
               .setLabel('Greetings')
               .setEmoji(CustomEmojis.GREETINGS),
            new ButtonBuilder().setStyle(1).setCustomId('module-roles').setLabel('Roles').setEmoji(CustomEmojis.ROLES),
            new ButtonBuilder()
               .setStyle(1)
               .setCustomId('module-levels')
               .setLabel('Levels')
               .setEmoji(CustomEmojis.LEVELS),
            new ButtonBuilder()
               .setStyle(1)
               .setCustomId('module-suggestions')
               .setLabel('Suggestions')
               .setEmoji(CustomEmojis.SUGGESTIONS),
            new ButtonBuilder()
               .setStyle(1)
               .setCustomId('module-starboard')
               .setLabel('Starboard')
               .setEmoji(CustomEmojis.STARBOARD),
         );
      return await auxdibot.createReply(interaction, {
         embeds: [embed],
         components: [modulesRow1, modulesRow2, promoRow.toJSON()],
      });
   },
};
