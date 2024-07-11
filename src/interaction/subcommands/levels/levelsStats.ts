import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { createLevelsStatEmbed } from '@/modules/features/levels/createLevelsStatEmbed';
import handleError from '@/util/handleError';

export const levelsStats = <AuxdibotSubcommand>{
   name: 'level',
   group: 'stats',
   info: {
      module: Modules['Levels'],
      description: "View a user's level stats. Leave empty to view your own.",
      usageExample: '/levels stats level [user]',
      allowedDefault: true,
      permissionsRequired: [],
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const user = interaction.options.getUser('user');
      const data = await auxdibot.database.servermembers.findFirst({
         where: { userID: user?.id || interaction.data.member.id, serverID: interaction.data.guild.id },
      });
      if (!data)
         return await handleError(auxdibot, 'MEMBER_DATA_NOT_FOUND', 'Member data could not be found!', interaction);

      return await auxdibot.createReply(interaction, {
         embeds: [await createLevelsStatEmbed(auxdibot, data, user ?? interaction.user)],
      });
   },
};
