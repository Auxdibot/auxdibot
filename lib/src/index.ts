import 'module-alias/register';
import { AuxdibotClient } from './modules/discord';
import { AuxdibotAPI } from './modules/express';
import { MongooseClient } from './modules/mongoose';

new MongooseClient();
new AuxdibotClient();
new AuxdibotAPI(['identify', 'guilds']);
