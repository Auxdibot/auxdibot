import { SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import Modules from '@/constants/bot/commands/Modules';
import levelCardBorder from '@/interaction/subcommands/level_card/levelCardBorder';
import levelCardBar from '@/interaction/subcommands/level_card/levelCardBar';
import levelCardPreview from '@/interaction/subcommands/level_card/levelCardPreview';

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
                  .setDescription('The color to start the border gradient with. (ex. #ffa900)')
                  .setRequired(true),
            )
            .addStringOption((option) =>
               option
                  .setName('end')
                  .setDescription('The color to end the border gradient with. (ex. #ffa900)')
                  .setRequired(true),
            ),
      )
      .addSubcommand((subcommand) =>
         subcommand
            .setName('bar')
            .setDescription('Change the progress bar color of your level card.')
            .addStringOption((option) =>
               option
                  .setName('start')
                  .setDescription('The color to start the border gradient with. (ex. #ffa900)')
                  .setRequired(true),
            )
            .addStringOption((option) =>
               option
                  .setName('end')
                  .setDescription('The color to end the border gradient with. (ex. #ffa900)')
                  .setRequired(true),
            ),
      )
      .addSubcommand((subcommand) => subcommand.setName('preview').setDescription('Preview your level card.'))
      .setContexts(0, 1, 2)
      .setIntegrationTypes(0, 1),
   info: {
      module: Modules['User'],
      description: "Get a user's avatar and user ID using Auxdibot.",
      usageExample: '/level_card (border|bar|preview)',
      allowedDefault: true,
      dmableCommand: true,
      premium: 'user',
   },
   subcommands: [levelCardBorder, levelCardBar, levelCardPreview],
   async execute() {
      return;
   },
};
