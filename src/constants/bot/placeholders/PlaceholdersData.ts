import Placeholders from './Placeholders';

export const PlaceholdersData: {
   [k in Placeholders]: {
      context: string | null;
      description: string;
   };
} = {
   SERVER_MEMBERS: {
      context: null,
      description: 'Get the total amount of members in the server.',
   },
   SERVER_NAME: {
      context: null,
      description: 'Get the server name.',
   },
   SERVER_ID: {
      context: null,
      description: 'Get the server ID.',
   },
   SERVER_ICON_512: {
      context: null,
      description: 'Get a 512x512px server icon URL. (Can be used as an image_url or thumbnail_url!)',
   },
   SERVER_ICON_128: {
      context: null,
      description: 'Get a 128x128px server icon URL. (Can be used as an image_url or thumbnail_url!)',
   },
   SERVER_ACRONYM: {
      context: null,
      description: "Get the server's acronym.",
   },
   SERVER_CREATED_DATE: {
      context: null,
      description: 'Get the date the server was created.',
   },
   SERVER_CREATED_DATE_FORMATTED: {
      context: null,
      description: 'Get the date the server was created formatted for Discord.',
   },
   SERVER_CREATED_DATE_UTC: {
      context: null,
      description: 'Get the date the server was created as a UTC date.',
   },
   SERVER_CREATED_DATE_ISO: {
      context: null,
      description: 'Get the date the server was created as an ISO date.',
   },
   SERVER_TOTAL_PUNISHMENTS: {
      context: null,
      description: 'Get the total amount of punishments on this server.',
   },
   MEMBER_ID: {
      context: 'member',
      description: 'Get the ID of the member being interacted with.',
   },
   MEMBER_TAG: {
      context: 'member',
      description: 'Get the tag of the member being interacted with.',
   },
   MEMBER_MENTION: {
      context: 'member',
      description: 'Mention the member being interacted with.',
   },
   MEMBER_CREATED_DATE: {
      context: 'member',
      description: 'Get the date the member joined discord.',
   },
   MEMBER_CREATED_DATE_FORMATTED: {
      context: 'member',
      description: 'Get the date the member joined Discord formatted for Discord.',
   },
   MEMBER_CREATED_DATE_UTC: {
      context: 'member',
      description: 'Get the date the member joined Discord as a UTC date.',
   },
   MEMBER_CREATED_DATE_ISO: {
      context: 'member',
      description: 'Get the date the member joined Discord as an ISO date.',
   },
   MEMBER_JOIN_DATE: {
      context: 'member_join',
      description: 'Get the date the member joined this server.',
   },
   MEMBER_JOIN_DATE_FORMATTED: {
      context: 'member_join',
      description: 'Get the date the member joined this server formatted for Discord.',
   },
   MEMBER_JOIN_DATE_UTC: {
      context: 'member_join',
      description: 'Get the date the member joined this server as a UTC date.',
   },
   MEMBER_JOIN_DATE_ISO: {
      context: 'member_join',
      description: 'Get the date the member joined this server as an ISO date.',
   },
   MEMBER_HIGHEST_ROLE: {
      context: 'member',
      description: 'Get the highest role the member has.',
   },
   MEMBER_IS_OWNER: {
      context: 'member',
      description: 'Get "Yes" or "No" depending on if the member is owner.',
   },
   MEMBER_IS_ADMIN: {
      context: 'member',
      description: 'Get "Yes" or "No" depending on if the member has Administrator permissions.',
   },
   MEMBER_AVATAR_512: {
      context: 'member',
      description: 'Get a 512x512px member avatar URL. (Can be used as an image_url or thumbnail_url!)',
   },
   MEMBER_AVATAR_128: {
      context: 'member',
      description: 'Get a 128x128px member avatar URL. (Can be used as an image_url or thumbnail_url!)',
   },
   MEMBER_EXPERIENCE: {
      context: 'member_levels',
      description: 'Get the experience of the member.',
   },
   MEMBER_LEVEL: {
      context: 'member_levels',
      description: 'Get the level of the member.',
   },
   MEMBER_XP_TILL: {
      context: 'member_levels',
      description: 'Get the experience needed to reach the next level.',
   },
   MEMBER_TOTAL_PUNISHMENTS: {
      context: 'member_punishments',
      description: 'The total amount of punishments this user has.',
   },
   MEMBER_LATEST_PUNISHMENT: {
      context: 'member_punishments',
      description: 'The type of the latest punishment this user has.',
   },
   MEMBER_LATEST_PUNISHMENT_ID: {
      context: 'member_punishments',
      description: 'The punishment ID of the latest punishment this user has.',
   },
   MEMBER_LATEST_PUNISHMENT_DATE: {
      context: 'member_punishments',
      description: 'The date of the latest punishment this user has.',
   },
   MEMBER_LATEST_PUNISHMENT_DATE_FORMATTED: {
      context: 'member_punishments',
      description: 'The date of the latest punishment this user has formatted for Discord.',
   },
   MEMBER_LATEST_PUNISHMENT_DATE_UTC: {
      context: 'member_punishments',
      description: 'The date of the latest punishment this user has as a UTC date.',
   },
   MEMBER_LATEST_PUNISHMENT_DATE_ISO: {
      context: 'member_punishments',
      description: 'The date of the latest punishment this user has as an ISO date.',
   },
   MESSAGE_DATE: {
      context: null,
      description: 'The date of the message this placeholder is being sent with.',
   },
   MESSAGE_DATE_FORMATTED: {
      context: null,
      description: 'The date of the message this placeholder is being sent with formatted for Discord.',
   },
   MESSAGE_DATE_UTC: {
      context: null,
      description: 'The date of the message this placeholder is being sent with as a UTC date.',
   },
   MESSAGE_DATE_ISO: {
      context: null,
      description: 'The date of the message this placeholder is being sent with as an ISO date.',
   },
   SUGGESTION_ID: {
      context: 'suggestion',
      description: 'The ID of the suggestion.',
   },
   SUGGESTION_STATE: {
      context: 'suggestion',
      description: 'The state of the suggestion.',
   },
   SUGGESTION_HANDLER_MENTION: {
      context: 'suggestion',
      description: 'The mention of the suggestion handler.',
   },
   SUGGESTION_HANDLED_REASON: {
      context: 'suggestion',
      description: 'The reason the suggestion was handled.',
   },
   SUGGESTION_CONTENT: {
      context: 'suggestion',
      description: 'The content of the suggestion.',
   },
   SUGGESTION_DATE: {
      context: 'suggestion',
      description: 'The date of the suggestion.',
   },
   SUGGESTION_DATE_FORMATTED: {
      context: 'suggestion',
      description: 'The date of the suggestion formatted for Discord.',
   },
   SUGGESTION_DATE_UTC: {
      context: 'suggestion',
      description: 'The date of the suggestion as a UTC date.',
   },
   SUGGESTION_DATE_ISO: {
      context: 'suggestion',
      description: 'The date of the suggestion as an ISO date.',
   },
   STARBOARD_MESSAGE_ID: {
      context: 'starboard',
      description: 'The ID of the starboard message.',
   },
   STARBOARD_MESSAGE_CONTENT: {
      context: 'starboard',
      description: 'The content of the starboard message.',
   },
   STARBOARD_MESSAGE_STARS: {
      context: 'starboard',
      description: 'The amount of stars the starboard message has.',
   },
   STARBOARD_MESSAGE_DATE: {
      context: 'starboard',
      description: 'The date of the starboard message.',
   },
   STARBOARD_MESSAGE_DATE_FORMATTED: {
      context: 'starboard',
      description: 'The date of the starboard message formatted for Discord.',
   },
   STARBOARD_MESSAGE_DATE_UTC: {
      context: 'starboard',
      description: 'The date of the starboard message as a UTC date.',
   },
   STARBOARD_MESSAGE_DATE_ISO: {
      context: 'starboard',
      description: 'The date of the starboard message as an ISO date.',
   },
   FEED_TITLE: {
      context: 'feed',
      description: 'The title of the feed.',
   },
   FEED_CONTENT: {
      context: 'feed',
      description: 'The content of the feed.',
   },
   FEED_LINK: {
      context: 'feed',
      description: 'The link of the feed.',
   },
   FEED_AUTHOR: {
      context: 'feed',
      description: 'The author of the feed.',
   },
   FEED_DATE: {
      context: 'feed',
      description: 'The date of the feed.',
   },
   FEED_DATE_FORMATTED: {
      context: 'feed',
      description: 'The date of the feed formatted for Discord.',
   },
   FEED_DATE_UTC: {
      context: 'feed',
      description: 'The date of the feed as a UTC date.',
   },
   FEED_DATE_ISO: {
      context: 'feed',
      description: 'The date of the feed as an ISO date.',
   },
};
