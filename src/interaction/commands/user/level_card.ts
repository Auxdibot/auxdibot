import { SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import Modules from '@/constants/bot/commands/Modules';
import levelCardBorder from '@/interaction/subcommands/level_card/levelCardBorder';

export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('level_card')
      .setDescription('Update your level card with a custom color and background. (PREMIUM)')
      .addSubcommand((subcommand) =>
         subcommand
            .setName('border')
            .setDescription('Change the border color of your level card.')
            .addStringOption((option) =>
               option
                  .setName('start')
                  .setDescription('The color to start the border gradient with. (HEX)')
                  .setRequired(true),
            )
            .addStringOption((option) =>
               option
                  .setName('end')
                  .setDescription('The color to end the border gradient with. (HEX)')
                  .setRequired(true),
            ),
      )
      .setContexts(0, 1, 2)
      .setIntegrationTypes(0, 1),
   info: {
      module: Modules['User'],
      description: "Get a user's avatar and user ID using Auxdibot.",
      usageExample: '/level_card (border)',
      allowedDefault: true,
      dmableCommand: true,
      premium: 'user',
   },
   subcommands: [levelCardBorder],
   async execute() {
      return;
   },
};
