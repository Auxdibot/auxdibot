import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleError from '@/util/handleError';
import handleLog from '@/util/handleLog';
import { EmbedBuilder } from '@discordjs/builders';
import { LogAction } from '@prisma/client';
import { PermissionsBitField } from 'discord.js';

export const exceptionsRemove = <AuxdibotSubcommand>{
   name: 'remove',
   group: 'exceptions',
   info: {
      module: Modules['Moderation'],
      description:
         "Remove an AutoMod role exception. If you've deleted the role, use the index parameter, which is the placement of the item on /moderation exceptions list.",
      usageExample: '/moderation exceptions remove [role] [index]',
      permission: 'moderation.exceptions.remove',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data || !interaction.memberPermissions) return;
      const role = interaction.options.getRole('role'),
         index = interaction.options.getNumber('index');
      const server = interaction.data.guildData;
      const exceptionID =
         role != null
            ? server.automod_role_exceptions.find((val: string) => role != null && val == role.id)
            : index
            ? server.automod_role_exceptions[index - 1]
            : undefined;

      if (!exceptionID) {
         return await handleError(
            auxdibot,
            'AUTOMOD_EXCEPTION_NOT_FOUND',
            "This role isn't added as an AutoMod role exception!",
            interaction,
         );
      }
      const exception = interaction.data.guild.roles.cache.get(exceptionID);
      if (
         exception &&
         interaction.data.member.id != interaction.data.guild.ownerId &&
         !interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) &&
         exception.comparePositionTo(interaction.data.member.roles.highest) <= 0
      ) {
         return await handleError(
            auxdibot,
            'ROLE_POSITION_HIGHER',
            'This role has a higher or equal position than your highest role!',
            interaction,
         );
      }
      if (
         exception &&
         interaction.data.guild.members.me &&
         exception.comparePositionTo(interaction.data.guild.members.me.roles.highest) >= 0
      ) {
         return await handleError(
            auxdibot,
            'ROLE_POSITION_HIGHER_BOT',
            "This role has a higher position than Auxdibot's highest role!",
            interaction,
         );
      }
      server.automod_role_exceptions.splice(server.automod_role_exceptions.indexOf(exceptionID), 1);
      await auxdibot.database.servers.update({
         where: { serverID: server.serverID },
         data: { automod_role_exceptions: server.automod_role_exceptions },
      });
      const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      successEmbed.title = '🛡️ Removed AutoMod Exception';
      successEmbed.description = `Removed <@&${exceptionID}> from the AutoMod role exceptions.`;
      await handleLog(auxdibot, interaction.data.guild, {
         userID: interaction.data.member.id,
         description: `Removed ${role.name} from the AutoMod role exceptions.`,
         type: LogAction.AUTOMOD_SETTINGS_CHANGE,
         date_unix: Date.now(),
      });
      return await interaction.reply({ embeds: [successEmbed] });
   },
};
