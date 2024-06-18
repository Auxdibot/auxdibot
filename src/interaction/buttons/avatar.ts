import AuxdibotButton from '@/interfaces/buttons/AuxdibotButton';
import {
   ButtonBuilder,
   ActionRowBuilder,
   EmbedBuilder,
   MessageComponentInteraction,
   User,
   ButtonStyle,
} from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import handleError from '@/util/handleError';
import { CustomEmojis } from '@/constants/bot/CustomEmojis';

export default <AuxdibotButton>{
   module: Modules['Moderation'],
   name: 'avatar',
   command: 'user',
   async execute(auxdibot: Auxdibot, interaction: MessageComponentInteraction) {
      if (!interaction.guild || !interaction.user || !interaction.channel) return;
      const [, user_id] = interaction.customId.split('-');
      await interaction.deferReply();

      const user: User | undefined = await auxdibot.users.fetch(user_id).catch(() => undefined);
      if (!user) return await handleError(auxdibot, 'USER_NOT_FOUND', "Auxdibot couldn't find that user!", interaction);
      const embed = new EmbedBuilder()
         .setTitle(`${CustomEmojis.USER} ${user.username} | User Avatar`)
         .setImage(user.avatarURL({ size: 1024 }))
         .setDescription(`Here is the avatar of the user ${user}.`);
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
         new ButtonBuilder()
            .setURL(user.avatarURL({ extension: 'png' }))
            .setStyle(ButtonStyle.Link)
            .setLabel('PNG'),
         new ButtonBuilder()
            .setURL(user.avatarURL({ extension: 'jpg' }))
            .setStyle(ButtonStyle.Link)
            .setLabel('JPG'),
         new ButtonBuilder()
            .setURL(user.avatarURL({ extension: 'webp' }))
            .setStyle(ButtonStyle.Link)
            .setLabel('WEBP'),
      );
      return await auxdibot.createReply(interaction, { embeds: [embed], components: [row] });
   },
};
