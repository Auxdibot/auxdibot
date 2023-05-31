import { EmbedBuilder } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();
// todo this is purely placeholder until proper error handling is added in
const Embeds = {
   ERROR_EMBED: new EmbedBuilder()
      .setColor(0xf44336)
      .setTitle('⛔ Error!')
      .setDescription('An error occurred trying to do this. Try again later!'),
};
export default Embeds;
