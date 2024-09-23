import AuxdibotButton from '@/interfaces/buttons/AuxdibotButton';
import { EmbedBuilder, MessageComponentInteraction } from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import handleError from '@/util/handleError';
import findOrCreateServer from '@/modules/server/findOrCreateServer';

export default <AuxdibotButton>{
   module: Modules['Roles'],
   name: 'rr',
   allowedDefault: true,
   async execute(auxdibot: Auxdibot, interaction: MessageComponentInteraction) {
      if (!interaction.guild || !interaction.member || !interaction.channel) return;
      const [, role_id] = interaction.customId.split('-');
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
      try {
         if (member.roles.cache.has(role_id)) {
            await member.roles.remove(role_id);
            const embed = new EmbedBuilder()
               .setColor(auxdibot.colors.accept)
               .setTitle('Role Removed')
               .setDescription(`You no longer have the role <@&${role_id}>.`);
            return await interaction.editReply({ embeds: [embed.toJSON()] });
         } else {
            if (rr.type == 'BUTTON_SELECT_ONE') {
               rr.reactions.forEach(
                  (i) => member.roles.cache.has(i.role) && member.roles.remove(i.role).catch(() => undefined),
               );
            }
            await member.roles.add(role_id);
            const embed = new EmbedBuilder()
               .setColor(auxdibot.colors.accept)
               .setTitle('Role Added')
               .setDescription(`You now have the role <@&${role_id}>.`);
            return await interaction.editReply({ embeds: [embed.toJSON()] });
         }
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
