import { EmbedField } from 'discord.js';

export default interface EmbedParameters {
   color?: string | number;
   title?: string;
   title_url?: string;
   description?: string;
   fields?: EmbedField[];
   author_text?: string;
   author_url?: string;
   author_icon?: string;
   footer_text?: string;
   footer_icon?: string;
   thumbnail_url?: string;
   image_url?: string;
}
