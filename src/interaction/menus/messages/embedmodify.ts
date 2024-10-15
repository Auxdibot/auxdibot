import { AnySelectMenuInteraction, ActionRowBuilder, TextInputBuilder, ModalBuilder, TextInputStyle } from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import handleError from '@/util/handleError';
import AuxdibotSelectMenu from '@/interfaces/menus/AuxdibotSelectMenu';

const labels = {
   title: 'Title',
   description: 'Description',
   color: 'Color',
   footer: 'Footer',
   image: 'Image',
   thumbnail: 'Thumbnail',
   content: 'Message Content',
   author: 'Author',
};
export default <AuxdibotSelectMenu>{
   module: Modules['Messages'],
   name: 'embedmodify',
   command: 'embed builder',
   async execute(auxdibot: Auxdibot, interaction: AnySelectMenuInteraction) {
      if (!interaction.guild || !interaction.member || !interaction.channel) return;
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
      const field = interaction.values[0];
      const modal = new ModalBuilder().setCustomId(`embedmodify-${id}`).setTitle(`Modify ${labels[field] ?? 'Embed'}`);
      switch (field) {
         case 'title':
            modal.addComponents(
               new ActionRowBuilder<TextInputBuilder>().addComponents(
                  new TextInputBuilder()
                     .setCustomId('title')
                     .setLabel('Title')
                     .setRequired(false)
                     .setStyle(TextInputStyle.Short)
                     .setPlaceholder('Enter the title of the embed')
                     .setValue(session.embed?.title ?? ''),
               ),
               new ActionRowBuilder<TextInputBuilder>().addComponents(
                  new TextInputBuilder()
                     .setCustomId('url')
                     .setLabel('URL')
                     .setRequired(false)
                     .setStyle(TextInputStyle.Short)
                     .setPlaceholder('Enter the URL to use for the title of the embed')
                     .setValue(session.embed?.url ?? ''),
               ),
            );
            break;
         case 'description':
            modal.addComponents(
               new ActionRowBuilder<TextInputBuilder>().addComponents(
                  new TextInputBuilder()
                     .setCustomId('description')
                     .setLabel('Description')
                     .setRequired(false)
                     .setStyle(TextInputStyle.Paragraph)
                     .setPlaceholder('Enter the description of the embed')
                     .setValue(session.embed?.description ?? ''),
               ),
            );
            break;
         case 'color':
            const hexCode = (session.embed?.color ?? 0).toString(16).padStart(6, '0');
            modal.addComponents(
               new ActionRowBuilder<TextInputBuilder>().addComponents(
                  new TextInputBuilder()
                     .setCustomId('color')
                     .setLabel('Color')
                     .setRequired(false)
                     .setStyle(TextInputStyle.Short)
                     .setPlaceholder('Enter the color of the embed (HEX VALUE)')
                     .setValue('#' + hexCode),
               ),
            );
            break;
         case 'footer':
            modal.addComponents(
               new ActionRowBuilder<TextInputBuilder>().addComponents(
                  new TextInputBuilder()
                     .setCustomId('footer')
                     .setLabel('Footer')
                     .setRequired(false)
                     .setStyle(TextInputStyle.Short)
                     .setPlaceholder('Enter the footer of the embed')
                     .setValue(session.embed?.footer?.text ?? ''),
               ),
               new ActionRowBuilder<TextInputBuilder>().addComponents(
                  new TextInputBuilder()
                     .setCustomId('footer_icon')
                     .setLabel('Footer Icon')
                     .setRequired(false)
                     .setStyle(TextInputStyle.Short)
                     .setPlaceholder('Enter the icon URL for the footer of the embed')
                     .setValue(session.embed?.footer?.icon_url ?? ''),
               ),
            );
            break;
         case 'image':
            modal.addComponents(
               new ActionRowBuilder<TextInputBuilder>().addComponents(
                  new TextInputBuilder()
                     .setCustomId('image')
                     .setLabel('Image')
                     .setRequired(false)
                     .setStyle(TextInputStyle.Short)
                     .setPlaceholder('Enter the image URL for the embed')
                     .setValue(session.embed?.image?.url ?? ''),
               ),
            );
            break;
         case 'thumbnail':
            modal.addComponents(
               new ActionRowBuilder<TextInputBuilder>().addComponents(
                  new TextInputBuilder()
                     .setCustomId('thumbnail')
                     .setLabel('Thumbnail')
                     .setRequired(false)
                     .setStyle(TextInputStyle.Short)
                     .setPlaceholder('Enter the thumbnail URL for the embed')
                     .setValue(session.embed?.thumbnail?.url ?? ''),
               ),
            );
            break;
         case 'content':
            modal.addComponents(
               new ActionRowBuilder<TextInputBuilder>().addComponents(
                  new TextInputBuilder()
                     .setCustomId('content')
                     .setLabel('Content')
                     .setRequired(false)
                     .setStyle(TextInputStyle.Paragraph)
                     .setPlaceholder('Enter the message content associate with the embed')
                     .setValue(session.content ?? ''),
               ),
            );
            break;
         case 'author':
            modal.addComponents(
               new ActionRowBuilder<TextInputBuilder>().addComponents(
                  new TextInputBuilder()
                     .setCustomId('author')
                     .setLabel('Author Text')
                     .setRequired(false)
                     .setStyle(TextInputStyle.Short)
                     .setPlaceholder('Enter the author text for the embed')
                     .setValue(session.embed?.author?.name ?? ''),
               ),
               new ActionRowBuilder<TextInputBuilder>().addComponents(
                  new TextInputBuilder()
                     .setCustomId('author_url')
                     .setLabel('Author URL')
                     .setRequired(false)
                     .setStyle(TextInputStyle.Short)
                     .setPlaceholder('Enter the URL to use for the author on the embed')
                     .setValue(session.embed?.author?.url ?? ''),
               ),
               new ActionRowBuilder<TextInputBuilder>().addComponents(
                  new TextInputBuilder()
                     .setCustomId('author_icon')
                     .setLabel('Author Icon')
                     .setRequired(false)
                     .setStyle(TextInputStyle.Short)
                     .setPlaceholder('Enter the author icon URL for the embed')
                     .setValue(session.embed?.author?.icon_url ?? ''),
               ),
            );
            break;
      }

      return await interaction.showModal(modal);
   },
};
