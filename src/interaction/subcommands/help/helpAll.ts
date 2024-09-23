import { CustomEmojis } from '@/constants/bot/CustomEmojis';
import Modules from '@/constants/bot/commands/Modules';
import { promoRow } from '@/constants/bot/promoRow';
import { Auxdibot } from '@/Auxdibot';
import { DMAuxdibotCommandData, GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { EmbedBuilder } from '@discordjs/builders';
import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

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
      const modulesRow = new ActionRowBuilder<StringSelectMenuBuilder>()
         .addComponents(
            new StringSelectMenuBuilder()
               .setCustomId('help')
               .setMaxValues(1)
               .setPlaceholder('Select a module to view more info...')
               .addOptions(
                  {
                     value: 'general',
                     label: 'General',
                     description: "Auxdibot's general commands and information.",
                     emoji: CustomEmojis.AUXDIBOT,
                  },
                  {
                     value: 'settings',
                     label: 'Settings',
                     description: "Commands to modify settings for Auxdibot's modules.",
                     emoji: CustomEmojis.SETTINGS,
                  },
                  {
                     value: 'moderation',
                     label: 'Moderation',
                     description: "Commands to moderate your server's members.",
                     emoji: CustomEmojis.MODERATION,
                  },
                  {
                     value: 'messages',
                     label: 'Messages',
                     description: 'Commands to create messages with extended features.',
                     emoji: CustomEmojis.MESSAGES,
                  },
                  {
                     value: 'greetings',
                     label: 'Greetings',
                     description: "Commands to manage your server's welcome messages.",
                     emoji: CustomEmojis.GREETINGS,
                  },
                  {
                     value: 'roles',
                     label: 'Roles',
                     description: "Commands to manage your server's roles.",
                     emoji: CustomEmojis.ROLES,
                  },
                  {
                     value: 'levels',
                     label: 'Levels',
                     description: "Commands to manage your server's leveling system.",
                     emoji: CustomEmojis.LEVELS,
                  },
                  {
                     value: 'suggestions',
                     label: 'Suggestions',
                     description: "Commands to manage your server's suggestion system.",
                     emoji: CustomEmojis.SUGGESTIONS,
                  },
                  {
                     value: 'starboard',
                     label: 'Starboard',
                     description: "Commands to manage your server's starboards.",
                     emoji: CustomEmojis.STARBOARD,
                  },
               ),
         )
         .toJSON();
      return await auxdibot.createReply(interaction, {
         embeds: [embed],
         components: [modulesRow, promoRow.toJSON()],
      });
   },
};
