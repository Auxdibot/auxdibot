import {APIEmbed, EmbedAuthorOptions, EmbedBuilder} from "discord.js";
import Colors from './Colors';
export const AUTHOR: EmbedAuthorOptions = {
    name: "Auxdibot"
}
const Embeds = {
    WELCOME_EMBED: new EmbedBuilder().setAuthor(AUTHOR).setColor(Colors.DEFAULT_COLOR).setTitle("👋 Hello!").setDescription("I am Auxdibot. Thank you for inviting me to your server. I am currently still in development and many of my features are incomplete." +
        "\n\n• I am a **slash command only** bot! Type `/`, then click on the icon for Auxdibot to see all my available commands!" +
        "\n• Do `/help` to see a list of all of my commands!" +
        "\n• Or do `/help [command_name]` to view information about a specific command!"),
    ERROR_EMBED: new EmbedBuilder().setAuthor(AUTHOR).setColor(Colors.DENIED_COLOR).setTitle("⛔ Error!")
        .setDescription("An error occurred trying to do this. Try again later!"),
    DEFAULT_EMBED: new EmbedBuilder().setAuthor(AUTHOR).setColor(Colors.DEFAULT_COLOR),
    SUCCESS_EMBED: new EmbedBuilder().setAuthor(AUTHOR).setColor(Colors.ACCEPTED_COLOR),
    DENIED_EMBED: new EmbedBuilder().setAuthor(AUTHOR).setColor(Colors.DENIED_COLOR),
    INFO_EMBED: new EmbedBuilder().setAuthor(AUTHOR).setColor(Colors.INFO_COLOR),
    PUNISHED_EMBED: new EmbedBuilder().setAuthor(AUTHOR).setColor(Colors.PUNISHMENT_COLOR),
    LOG_EMBED: new EmbedBuilder().setAuthor(AUTHOR).setColor(Colors.LOG_COLOR)
}
export default Embeds;


