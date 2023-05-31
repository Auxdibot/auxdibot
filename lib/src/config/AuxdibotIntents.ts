import { GatewayIntentBits } from 'discord.js';

export const AuxdibotIntents = [
   GatewayIntentBits.Guilds,
   GatewayIntentBits.GuildMembers,
   GatewayIntentBits.GuildModeration,
   GatewayIntentBits.GuildMessages,
   GatewayIntentBits.GuildMessageReactions,
   GatewayIntentBits.GuildVoiceStates,
   GatewayIntentBits.DirectMessages,
   GatewayIntentBits.DirectMessageReactions,
   GatewayIntentBits.MessageContent,
];
