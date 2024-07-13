export const DEFAULT_JOIN_EMBED = {
   type: 'rich',
   title: '👋 Member joined! ({%SERVER_MEMBERS%} members.)',
   thumbnail: { url: '{%MEMBER_AVATAR_128%}' },
   footer: { text: '{%SERVER_NAME%}' },
   description: '{%MEMBER_MENTION%} joined the server.',
   color: 9159498,
   author: { name: '{%MESSAGE_DATE%}' },
};
export const DEFAULT_JOIN_DM_EMBED = {
   type: 'rich',
   title: '👋 Welcome to {%SERVER_NAME%}!',
   thumbnail: { url: '{%SERVER_ICON_128%}' },
   footer: { text: '{%SERVER_NAME%}' },
   description: 'Welcome, {%MEMBER_MENTION%}! We hope you enjoy our server.',
   color: 9159498,
   author: { name: '{%MESSAGE_DATE%}' },
};
export const DEFAULT_LEAVE_EMBED = {
   type: 'rich',
   title: '👋 Member left! ({%SERVER_MEMBERS%} members.)',
   thumbnail: { url: '{%MEMBER_AVATAR_128%}' },
   footer: { text: '{%SERVER_NAME%}' },
   description: '{%MEMBER_MENTION%} left the server.',
   color: 16007990,
   author: { name: '{%MESSAGE_DATE%}' },
};
export const DEFAULT_LEVELUP_EMBED = {
   type: 'rich',
   title: '🏆 Level Up!',
   description:
      '{%MEMBER_MENTION%} leveled up.\n\n🏅 Experience: `{%MEMBER_EXPERIENCE%} XP`\n\n🏆 `Level {%LEVEL_FROM%}` -> `Level {%LEVEL_TO%}`',
   color: 15845147,
   author: { name: '{%MEMBER_TAG%}', icon_url: '{%MEMBER_AVATAR_128%}' },
};
export const DEFAULT_SUGGESTION_EMBED = {
   type: 'rich',
   title: 'Suggestion #{%SUGGESTION_ID%}',
   description: '🕰️ Date: {%SUGGESTION_DATE_FORMATTED%}\n{%SUGGESTION_STATE%}',
   fields: [{ value: '{%SUGGESTION_CONTENT%}', name: 'Suggestion', inline: false }],
   color: 6052956,
   author: { name: '{%MEMBER_TAG%}', icon_url: '{%MEMBER_AVATAR_128%}' },
};
export const DEFAULT_SUGGESTION_UPDATE_EMBED = {
   type: 'rich',
   title: '{%SUGGESTION_STATE%} Suggestion #{%SUGGESTION_ID%}',
   fields: [{ value: '{%SUGGESTION_HANDLED_REASON%}', name: 'Reason', inline: false }],
   description:
      '🕰️ Date: {%SUGGESTION_DATE_FORMATTED%}\n🧍 Handled by: {%SUGGESTION_HANDLER_MENTION%} \n\n{%SUGGESTION_CONTENT%}',
   color: 6052956,
   author: { name: '{%MEMBER_TAG%}', icon_url: '{%MEMBER_AVATAR_128%}' },
};
export const DEFAULT_STARBOARD_MESSAGE_EMBED = {
   type: 'rich',
   footer: {
      text: 'Message ID: {%STARBOARD_MESSAGE_ID%} | {%STARBOARD_MESSAGE_DATE_UTC%}',
   },
   description: '{%STARBOARD_MESSAGE_CONTENT%}',
   color: 16764160,
   author: {
      name: '{%MEMBER_TAG%}',
      icon_url: '{%MEMBER_AVATAR_128%}',
   },
};
