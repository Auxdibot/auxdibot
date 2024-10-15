import { ModalSubmitInteraction } from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import AuxdibotModal from '@/interfaces/modals/AuxdibotModal';
import handleError from '@/util/handleError';
import { createEmbedBuilder } from '@/modules/features/embeds/createEmbedBuilder';

export default <AuxdibotModal>{
   module: Modules['Messages'],
   name: 'embedmodify',
   command: 'embed builder',
   async execute(auxdibot: Auxdibot, interaction: ModalSubmitInteraction) {
      const [, id] = interaction.customId.split('-');
      const session = auxdibot.build_sessions.get(
         `${interaction.guildId}:${interaction.channelId}:${interaction.message.id}`,
      );
      if (!session) {
         return handleError(
            auxdibot,
            'SESSION_INACTIVE',
            'This session has gone inactive! Run the /embed builder command to start a new session.\n\n*By default, sessions will go inactive after 5 minutes.*',
            interaction,
         );
      }
      if (session.userID !== interaction.user.id) {
         return handleError(
            auxdibot,
            'SESSION_USER_MISMATCH',
            'This session was started by another user!',
            interaction,
         );
      }
      await interaction.deferReply();
      const changes = {};

      for (const i of interaction.fields.fields.keys()) {
         switch (i) {
            case 'color':
               const inputValue = interaction.fields.getTextInputValue(i).replace('#', '');
               if (inputValue && !inputValue.match(/[0-9a-fA-F]{6}/)) {
                  return handleError(
                     auxdibot,
                     'INVALID_COLOR',
                     'The provided color is not valid! Please provide a valid hex color code.',
                     interaction,
                  );
               }
               changes[i] = inputValue ? parseInt(inputValue, 16) : undefined;
               break;
            case 'author':
            case 'author_icon':
            case 'author_url':
               if (i != 'author') {
                  const url = interaction.fields.getTextInputValue(i);
                  if (url && !url.match(/(http|https):\/\//)) {
                     return handleError(
                        auxdibot,
                        'INVALID_URL_AUTHOR',
                        'The provided URL is not valid! Please provide a valid URL.',
                        interaction,
                     );
                  }
               }
               changes['author'] = {
                  ...changes['author'],
                  name:
                     i == 'author'
                        ? interaction.fields.getTextInputValue(i)
                        : changes['author']?.name ?? session.embed?.author?.name,
                  icon_url:
                     i == 'author_icon'
                        ? interaction.fields.getTextInputValue(i)
                        : changes['author']?.icon_url ?? session.embed?.author?.icon_url,
                  url:
                     i == 'author_url'
                        ? interaction.fields.getTextInputValue(i)
                        : changes['author']?.url ?? session.embed?.author?.url,
               };
               break;
            case 'footer':
            case 'footer_icon':
               if (i == 'footer_icon') {
                  const icon = interaction.fields.getTextInputValue(i);
                  if (icon && !icon.match(/(http|https):\/\//)) {
                     return handleError(
                        auxdibot,
                        'INVALID_FOOTER_ICON_URL',
                        'The provided footer icon URL is not valid! Please provide a valid URL.',
                        interaction,
                     );
                  }
               }
               changes['footer'] = {
                  ...changes['footer'],
                  text:
                     i == 'footer'
                        ? interaction.fields.getTextInputValue(i)
                        : changes['footer']?.text ?? session.embed?.footer?.text,
                  icon_url:
                     i == 'footer_icon'
                        ? interaction.fields.getTextInputValue(i)
                        : changes['footer']?.icon_url ?? session.embed?.footer?.icon_url,
               };
               break;
            case 'image':
            case 'thumbnail':
               const imgURL = interaction.fields.getTextInputValue(i);
               if (imgURL && !imgURL.match(/(http|https):\/\//)) {
                  return handleError(
                     auxdibot,
                     'INVALID_IMAGE_URL',
                     'The provided image URL is not valid! Please provide a valid URL.',
                     interaction,
                  );
               }
               changes[i] = { url: interaction.fields.getTextInputValue(i) };
               break;
            case 'url':
               const url = interaction.fields.getTextInputValue(i);
               if (url && !url.match(/(http|https):\/\//)) {
                  return handleError(
                     auxdibot,
                     'INVALID_URL',
                     'The provided URL is not valid! Please provide a valid URL.',
                     interaction,
                  );
               }
               changes[i] = interaction.fields.getTextInputValue(i);
               break;
            default:
               if (i != 'content') changes[i] = interaction.fields.getTextInputValue(i);
               break;
         }
      }
      const content = interaction.fields.fields.has('content')
         ? interaction.fields.getTextInputValue('content')
         : undefined;

      await createEmbedBuilder(auxdibot, interaction, id, interaction.message, {
         ...session,
         content: content ? content : session.content,
         embed: session.embed ? { ...session.embed, ...changes } : changes,
      })
         .then(() => interaction.deleteReply().catch(() => undefined))
         .catch(() => undefined);
   },
};
