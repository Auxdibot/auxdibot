import { EmbedBuilder, AnySelectMenuInteraction } from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import handleError from '@/util/handleError';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import AuxdibotSelectMenu from '@/interfaces/menus/AuxdibotSelectMenu';

export default <AuxdibotSelectMenu>{
   module: Modules['Roles'],
   name: 'rr',
   permission: 'roles.menu.use',
   allowedDefault: true,
   async execute(auxdibot: Auxdibot, interaction: AnySelectMenuInteraction) {
      if (!interaction.guild || !interaction.member || !interaction.channel) return;
      const roles = interaction.values;
      await interaction.deferReply({ ephemeral: true });
      const server = await findOrCreateServer(auxdibot, interaction.guildId);
      const rr = server.reaction_roles.find((i) => interaction.message.id == i.messageID);
      if (!rr) {
         await handleError(
            auxdibot,
            'NO_REACTION_ROLE_FOUND',
            'This reaction role has been deactivated! Ask an Administrator to delete this reaction role message.',
            interaction,
         );
      }
      const member = await interaction.guild.members.fetch(interaction.member.user.id);
      const removed = [];
      const added = [];
      try {
         for (const role_id of roles) {
            if (member.roles.cache.has(role_id)) {
               await member.roles.remove(role_id);
               removed.push(role_id);
            } else {
               if (rr.type == 'SELECT_ONE_MENU') {
                  rr.reactions.forEach(
                     (i) =>
                        member.roles.cache.has(i.role) &&
                        member.roles.remove(i.role).catch(() => undefined) &&
                        removed.push(i.role),
                  );
               }
               await member.roles.add(role_id);
               added.push(role_id);
            }
         }
         const embed = new EmbedBuilder()
            .setColor(auxdibot.colors.accept)
            .setTitle('Roles Changed')
            .setDescription(
               `${added.map((i) => `➕ <@&${i}>`).join('\n')}\n${removed.map((i) => `➖ <@&${i}>`).join('\n')}`,
            );
         await interaction.message.edit({
            components: [interaction.message.components[0]],
         });
         return await interaction.editReply({ embeds: [embed.toJSON()] });
      } catch (x) {
         console.log(x);
         await handleError(
            auxdibot,
            'REACTION_ROLE_FAILED',
            'An error occurred attempting to give you that role!',
            interaction,
         );
      }
      return;
   },
};
