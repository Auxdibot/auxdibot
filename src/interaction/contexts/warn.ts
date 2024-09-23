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
import { punishWarn } from '../subcommands/moderation/punish/punishWarn';
import Modules from '@/constants/bot/commands/Modules';
import canExecute from '@/util/canExecute';

export default <AuxdibotContextMenu>{
   data: new ContextMenuCommandBuilder()
      .setName('Warn User')
      .setType(ApplicationCommandType.User)
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
   command: 'punish warn',
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
         .setCustomId(`warn-${interaction.targetUser.id}`)
         .setTitle('Warn User')
         .addComponents(
            new ActionRowBuilder<TextInputBuilder>().setComponents(
               new TextInputBuilder()
                  .setCustomId('reason')
                  .setPlaceholder('The reason given for the warn.')
                  .setLabel('What is the warn reason?')
                  .setMaxLength(200)
                  .setStyle(TextInputStyle.Short),
            ),
         );
      await interaction.showModal(modal).catch((x) => console.log(x));
   },
   info: {
      ...punishWarn.info,
      module: Modules['Moderation'],
   },
};
