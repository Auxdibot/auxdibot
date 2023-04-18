import {APIEmbed, EmbedBuilder, EmbedField} from "discord.js";

export default interface EmbedParameters {
    color: string;
    title: string;
    description: string | undefined;
    fields: EmbedField[] | undefined;
    author_text: string | undefined;
    footer: string | undefined;
    thumbnail_url: string | undefined;
    image_url: string | undefined;
}
export function toAPIEmbed(parameters: EmbedParameters): APIEmbed {
    let embed = new EmbedBuilder().setColor(parseInt("0x" + parameters.color.replaceAll("#", ""), 16)).setTitle(parameters.title).setDescription(parameters.description || null).setAuthor(parameters.author_text ? {
        name: parameters.author_text
    } : null).setFooter(parameters.footer ? {
        text: parameters.footer
    } : null).setThumbnail(parameters.thumbnail_url || null).setImage(parameters.image_url || null).toJSON();
    embed.fields = parameters.fields;
    return embed;
}