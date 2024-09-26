import AuxdibotFeatureModule from '@/interfaces/commands/AuxdibotFeatureModule';
import { CustomEmojis } from '../CustomEmojis';

const Modules = {
   General: <AuxdibotFeatureModule>{
      name: 'General',
      description: 'General purpose module, containing essential information about Auxdibot.',
      emoji: CustomEmojis.AUXDIBOT,
   },
   User: <AuxdibotFeatureModule>{
      name: 'User',
      description: 'Module for commands that can be used when Auxdibot is installed on a user.',
      emoji: CustomEmojis.USER,
   },
   Settings: <AuxdibotFeatureModule>{
      name: 'Settings',
      description:
         'Module for changing and viewing server settings, as well as disabling or enabling specific features.',
      emoji: CustomEmojis.SETTINGS,
   },
   Messages: <AuxdibotFeatureModule>{
      name: 'Messages',
      description:
         'Used for sending messages, scheduling messages, building Embeds, editing Embed content, and getting information about Discord Embeds.',
      disableable: true,
      emoji: CustomEmojis.MESSAGES,
   },
   Moderation: <AuxdibotFeatureModule>{
      name: 'Moderation',
      description: 'Module for handling moderation or punishments on your server.',
      disableable: true,
      emoji: CustomEmojis.MODERATION,
   },
   Roles: <AuxdibotFeatureModule>{
      name: 'Roles',
      description: 'Module for handling role-related features, including massroles, and reaction roles.',
      disableable: true,
      emoji: CustomEmojis.ROLES,
   },
   Levels: <AuxdibotFeatureModule>{
      name: 'Levels',
      description:
         'Module for levels on this server, including giving experience for sending messages, and the levels leaderboard.',
      disableable: true,
      emoji: CustomEmojis.LEVELS,
   },
   Suggestions: <AuxdibotFeatureModule>{
      name: 'Suggestions',
      description: 'Module for setting up, handling, and creating suggestions on your server.',
      disableable: true,
      emoji: CustomEmojis.SUGGESTIONS,
   },
   Starboard: <AuxdibotFeatureModule>{
      name: 'Starboard',
      description: "Module for setting up and handling the server's starboard.",
      disableable: true,
      emoji: CustomEmojis.STARBOARD,
   },
   Greetings: <AuxdibotFeatureModule>{
      name: 'Greetings',
      description: "Module for setting up and editing the server's various greeting messages.",
      disableable: true,
      emoji: CustomEmojis.GREETINGS,
   },
};
export default Modules;
