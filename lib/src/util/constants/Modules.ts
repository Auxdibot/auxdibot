import AuxdibotFeatureModule from '@util/types/AuxdibotFeatureModule';

const Modules = {
   embeds: <AuxdibotFeatureModule>{
      name: 'Embeds',
      description: 'Used for building Embeds, editing Embed content, and getting information about Discord Embeds.',
      disableable: true,
   },
   general: <AuxdibotFeatureModule>{
      name: 'General',
      description: 'General purpose module, containing essential information about Auxdibot.',
   },
   levels: <AuxdibotFeatureModule>{
      name: 'Levels',
      description:
         'Module for levels on this server, including giving experience for sending messages, and the levels leaderboard.',
      disableable: true,
   },
   moderation: <AuxdibotFeatureModule>{
      name: 'Moderation',
      description: 'Module for handling moderation or punishments on your server.',
      disableable: true,
   },
   permissions: <AuxdibotFeatureModule>{
      name: 'Permissions',
      description: 'Module for handling custom permission overrides for specific roles or users.',
      disableable: true,
   },
   roles: <AuxdibotFeatureModule>{
      name: 'Roles',
      description: 'Module for handling role-related features, including massroles, and reaction roles.',
      disableable: true,
   },
   settings: <AuxdibotFeatureModule>{
      name: 'Settings',
      description:
         'Module for changing and viewing server settings, as well as disabling or enabling specific features.',
   },
   suggestions: <AuxdibotFeatureModule>{
      name: 'Suggestions',
      description: 'Module for setting up, handling, and creating suggestions on your server.',
      disableable: true,
   },
};
export default Modules;
