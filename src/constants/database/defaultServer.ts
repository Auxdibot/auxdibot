import { APIEmbed, servers } from '@prisma/client';
import { DEFAULT_JOIN_DM_EMBED, DEFAULT_JOIN_EMBED, DEFAULT_LEAVE_EMBED } from '../embeds/DefaultEmbeds';

export const defaultServer: Partial<servers> = {
   suggestions_reactions: ['🔼', '🟦', '🔽'],
   join_dm_embed: DEFAULT_JOIN_DM_EMBED as APIEmbed,
   join_embed: DEFAULT_JOIN_EMBED as APIEmbed,
   leave_embed: DEFAULT_LEAVE_EMBED as APIEmbed,
   suggestions: [],
   punishments: [],
   starred_messages: [],
   level_rewards: [],
   join_roles: [],
   sticky_roles: [],
   reaction_roles: [],
   starboard_boards: [],
};
