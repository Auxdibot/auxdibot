import 'module-alias/register';
import 'dotenv/config';
import { Auxdibot } from './Auxdibot';

let bot = null;
try {
   bot = new Auxdibot();
} catch (e) {
   console.error('\u001b[31m', 'An error occurred in the bot process:', e, '\u001b[0m');
}

export default bot as Auxdibot;
