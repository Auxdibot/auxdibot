export const DEFAULT_JOIN_EMBED = {
   type: 'rich',
   title: '👋 Member joined! (%server_members% members.)',
   thumbnail: { url: '%member_avatar_128%' },
   footer: { text: '%server_name%' },
   description: '%member_mention% joined the server.',
   color: 9159498,
   author: { name: '%message_date%' },
};
export const DEFAULT_JOIN_DM_EMBED = {
   type: 'rich',
   title: '👋 Welcome to %server_name%!',
   thumbnail: { url: '%server_icon_128%' },
   footer: { text: '%server_name%' },
   description: 'Welcome, %member_mention%! We hope you enjoy our server.',
   color: 9159498,
   author: { name: '%message_date%' },
};
export const DEFAULT_LEAVE_EMBED = {
   type: 'rich',
   title: '👋 Member left! (%server_members% members.)',
   thumbnail: { url: '%member_avatar_128%' },
   footer: { text: '%server_name%' },
   description: '%member_mention% left the server.',
   color: 16007990,
   author: { name: '%message_date%' },
};
export const DEFAULT_LEVELUP_EMBED = {
   type: 'rich',
   title: '🏆 Level Up!',
   description: '%member_mention% leveled up.\n\n🏅 Experience: `%member_experience% XP`\n\n🏆 %levelup%',
   color: 15845147,
   author: { name: '%member_tag%', icon_url: '%member_avatar_128%' },
};
export const DEFAULT_SUGGESTION_EMBED = {
   type: 'rich',
   title: 'Suggestion #%suggestion_id%',
   description: '🕰️ Date: %suggestion_date_formatted%\n%suggestion_state%',
   fields: [{ value: '%suggestion_content%', name: 'Suggestion', inline: false }],
   color: 6052956,
   author: { name: '%member_tag%', icon_url: '%member_avatar_128%' },
};
export const DEFAULT_SUGGESTION_UPDATE_EMBED = {
   type: 'rich',
   title: '%suggestion_state% Suggestion #%suggestion_id%',
   fields: [{ value: '%suggestion_handled_reason%', name: 'Reason', inline: false }],
   description:
      '🕰️ Date: %suggestion_date_formatted%\n🧍 Handled by: %suggestion_handler_mention% \n\n%suggestion_content%',
   color: 6052956,
   author: { name: '%member_tag%', icon_url: '%member_avatar_128%' },
};
export const DEFAULT_STARBOARD_MESSAGE_EMBED = {
   type: 'rich',
   footer: {
      text: 'Message ID: %starboard_message_id% | %starboard_message_date_utc%',
   },
   description: '%starboard_message_content%',
   color: 16764160,
   author: {
      name: '%member_tag%',
      icon_url: '%member_avatar_128%',
   },
};
