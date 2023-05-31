import { Auxdibot } from '@/interfaces/Auxdibot';
import onReady from './client/onReady';
import { BaseInteraction } from 'discord.js';
import buttonCreate from './button/buttonCreate';
import slashCreate from './command/slashCreate';
import messageCreate from './message/messageCreate';
import messageUpdate from './message/messageUpdate';
import messageDelete from './message/messageDelete';
import messageReactionAdd from './reaction/messageReactionAdd';
import messageReactionRemove from './reaction/messageReactionRemove';
import roleDelete from './roles/roleDelete';
import guildCreate from './guild/guildCreate';
import guildDelete from './guild/guildDelete';
import guildMemberAdd from './guild/guildMemberAdd';
import guildMemberRemove from './guild/guildMemberRemove';

export default function listenEvents(auxdibot: Auxdibot) {
   auxdibot.once('ready', onReady);
   auxdibot.on('interactionCreate', (interaction: BaseInteraction) => {
      if (interaction.isButton()) buttonCreate(interaction);
      else if (interaction.isChatInputCommand()) slashCreate(interaction);
   });
   auxdibot.on('guildCreate', guildCreate);
   auxdibot.on('guildDelete', guildDelete);
   auxdibot.on('guildMemberAdd', guildMemberAdd);
   auxdibot.on('guildMemberRemove', guildMemberRemove);
   auxdibot.on('messageCreate', messageCreate);
   auxdibot.on('messageUpdate', messageUpdate);
   auxdibot.on('messageDelete', messageDelete);
   auxdibot.on('messageReactionAdd', messageReactionAdd);
   auxdibot.on('messageReactionRemove', messageReactionRemove);
   auxdibot.on('roleDelete', roleDelete);
}
