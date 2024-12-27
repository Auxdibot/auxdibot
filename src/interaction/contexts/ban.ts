import { Auxdibot } from '@/Auxdibot';
import { AuxdibotContextMenu } from '@/interfaces/contexts/AuxdibotContextMenu';
import handleError from '@/util/handleError';
import { ActionRowBuilder, TextInputBuilder } from '@discordjs/builders';
import {
   ContextMenuCommandInteraction,
   ModalBuilder,
   PermissionFlagsBits,
   TextInputStyle,
   ContextMenuCommandBuilder,
   ApplicationCommandType,
   EmbedBuilder,
} from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import canExecute from '@/util/canExecute';
import { punishBan } from '../subcommands/moderation/punish/punishBan';

export default <AuxdibotContextMenu>{
   data: new ContextMenuCommandBuilder()
      .setName('Ban User')
      .setType(ApplicationCommandType.User)
      .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
   command: 'punish ban',
   async execute(auxdibot: Auxdibot, interaction: ContextMenuCommandInteraction) {
      if (!interaction.isUserContextMenuCommand()) {
         return handleError(
            auxdibot,
            'USER_REQUIRED',
            'A user needs to be selected in order to use this!',
            interaction,
            true,
         );
      }
      const target = await interaction.guild.members.fetch(interaction.targetMember.user.id).catch(() => undefined),
         executor = await interaction.guild.members.fetch(interaction.member.user.id).catch(() => undefined);
      if (!target) {
         return handleError(auxdibot, 'USER_NOT_IN_SERVER', 'The user is not in the server!', interaction);
      }
      if (!canExecute(interaction.guild, executor, target)) {
         const noPermissionEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
         noPermissionEmbed.title = '⛔ No Permission!';
         noPermissionEmbed.description = `This user has a higher role than you or owns this server!`;
         return await auxdibot.createReply(interaction, { embeds: [noPermissionEmbed] });
      }
      const modal = new ModalBuilder()
         .setCustomId(`ban-${interaction.targetUser.id}`)
         .setTitle('Ban User')
         .addComponents(
            new ActionRowBuilder<TextInputBuilder>().setComponents(
               new TextInputBuilder()
                  .setCustomId('reason')
                  .setPlaceholder('The reason given for the ban.')
                  .setLabel('What is the ban reason?')
                  .setMaxLength(200)
                  .setStyle(TextInputStyle.Short),
            ),
            new ActionRowBuilder<TextInputBuilder>().setComponents(
               new TextInputBuilder()
                  .setCustomId('duration')
                  .setPlaceholder('The duration of the ban. (ex. "1m" for 1 minute, "5d" for 5 days, "1h" for 1 hour)')
                  .setLabel('What is the duration of the ban?')
                  .setMaxLength(200)
                  .setStyle(TextInputStyle.Short)
                  .setRequired(false),
            ),
            new ActionRowBuilder<TextInputBuilder>().setComponents(
               new TextInputBuilder()
                  .setCustomId('delete-message-days')
                  .setPlaceholder(
                     'Days back that mesage history should be deleted. (ex. "1" for 1 day, "7" for 7 days)',
                  )
                  .setLabel('Days to delete message history?')
                  .setMaxLength(200)
                  .setStyle(TextInputStyle.Short)
                  .setRequired(false),
            ),
         );
      await interaction.showModal(modal).catch((x) => console.log(x));
   },
   info: {
      ...punishBan.info,
      module: Modules['Moderation'],
   },
};
