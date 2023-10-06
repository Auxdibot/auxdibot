import AuxdibotFeatureModule from '@/interfaces/commands/AuxdibotFeatureModule';

const Modules = {
   General: <AuxdibotFeatureModule>{
      name: 'General',
      description: 'General purpose module, containing essential information about Auxdibot.',
   },
   Settings: <AuxdibotFeatureModule>{
      name: 'Settings',
      description:
         'Module for changing and viewing server settings, as well as disabling or enabling specific features.',
   },
   Messages: <AuxdibotFeatureModule>{
      name: 'Messages',
      description:
         'Used for sending messages, scheduling messages, building Embeds, editing Embed content, and getting information about Discord Embeds.',
      disableable: true,
   },
   Moderation: <AuxdibotFeatureModule>{
      name: 'Moderation',
      description: 'Module for handling moderation or punishments on your server.',
      disableable: true,
   },
   Permissions: <AuxdibotFeatureModule>{
      name: 'Permissions',
      description: 'Module for handling custom permission overrides for specific roles or users.',
      disableable: true,
   },
   Roles: <AuxdibotFeatureModule>{
      name: 'Roles',
      description: 'Module for handling role-related features, including massroles, and reaction roles.',
      disableable: true,
   },
   Levels: <AuxdibotFeatureModule>{
      name: 'Levels',
      description:
         'Module for levels on this server, including giving experience for sending messages, and the levels leaderboard.',
      disableable: true,
   },
   Suggestions: <AuxdibotFeatureModule>{
      name: 'Suggestions',
      description: 'Module for setting up, handling, and creating suggestions on your server.',
      disableable: true,
   },
   Starboard: <AuxdibotFeatureModule>{
      name: 'Starboard',
      description: "Module for setting up and handling the server's starboard.",
      disableable: true,
   },
   Greetings: <AuxdibotFeatureModule>{
      name: 'Greetings',
      description: "Module for setting up and editing the server's various greeting messages.",
      disableable: true,
   },
};
export default Modules;
