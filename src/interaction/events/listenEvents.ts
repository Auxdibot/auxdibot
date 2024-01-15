import { Auxdibot } from '@/interfaces/Auxdibot';
import onReady from './client/onReady';
import { BaseInteraction } from 'discord.js';
import buttonCreate from './interaction/buttonCreate';
import slashCreate from './interaction/slashCreate';
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
import threadCreate from './thread/threadCreate';
import threadDelete from './thread/threadDelete';
import channelCreate from './channel/channelCreate';
import channelDelete from './channel/channelDelete';
import voiceStateUpdate from './voice/voiceStateUpdate';

export default function listenEvents(auxdibot: Auxdibot) {
   auxdibot.once('ready', () => onReady(auxdibot));
   auxdibot.on('interactionCreate', (interaction: BaseInteraction) => {
      if (interaction.isButton()) buttonCreate(auxdibot, interaction);
      else if (interaction.isChatInputCommand()) slashCreate(auxdibot, interaction);
   });
   auxdibot.on('guildCreate', (guild) => guildCreate(auxdibot, guild));
   auxdibot.on('guildDelete', (guild) => guildDelete(auxdibot, guild));
   auxdibot.on('guildMemberAdd', (member) => guildMemberAdd(auxdibot, member));
   auxdibot.on('guildMemberRemove', (member) => guildMemberRemove(auxdibot, member));
   auxdibot.on('messageCreate', (message) => messageCreate(auxdibot, message));
   auxdibot.on('messageUpdate', (oldMessage, newMessage) => messageUpdate(auxdibot, oldMessage, newMessage));
   auxdibot.on('messageDelete', (message) => messageDelete(auxdibot, message));
   auxdibot.on('messageReactionAdd', (reaction, user) => messageReactionAdd(auxdibot, reaction, user));
   auxdibot.on('messageReactionRemove', (reaction, user) => messageReactionRemove(auxdibot, reaction, user));
   auxdibot.on('roleDelete', (role) => roleDelete(auxdibot, role));
   auxdibot.on('threadCreate', (thread, newlyCreated) => threadCreate(auxdibot, thread, newlyCreated));
   auxdibot.on('threadDelete', (thread) => threadDelete(auxdibot, thread));
   auxdibot.on('channelCreate', (channel) => channelCreate(auxdibot, channel));
   auxdibot.on('channelDelete', (channel) => channelDelete(auxdibot, channel));
   auxdibot.on('voiceStateUpdate', (oldState, newState) => voiceStateUpdate(auxdibot, oldState, newState));
}
