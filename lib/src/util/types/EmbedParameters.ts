import {APIEmbed, EmbedBuilder, EmbedField} from "discord.js";

export default interface EmbedParameters {
    color?: string;
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
export function toAPIEmbed(parameters: EmbedParameters): APIEmbed {
    let embed = new EmbedBuilder().setColor(parameters.color && /(#|)[0-9a-fA-F]{6}/.test(parameters.color) ? parseInt("0x" + parameters.color.replaceAll("#", ""), 16) : null)
    .setTitle(parameters.title || null)
    .setURL(parameters.title_url || null)
    .setDescription(parameters.description || null).setAuthor(parameters.author_text ? {
        name: parameters.author_text,
        url: parameters.author_url,
        iconURL: parameters.author_icon,

    } : null).setFooter(parameters.footer_text ? {
        text: parameters.footer_text,
        iconURL: parameters.footer_icon,
    } : null).toJSON();
    embed.fields = parameters.fields;
    embed.thumbnail = parameters.thumbnail_url ? {
        url: parameters.thumbnail_url
    } : undefined;
    embed.image = parameters.image_url ? {
        url: parameters.image_url
    } : undefined;
    return embed;
}