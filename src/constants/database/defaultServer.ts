import { APIEmbed, servers } from '@prisma/client';
import {
   DEFAULT_JOIN_DM_EMBED,
   DEFAULT_JOIN_EMBED,
   DEFAULT_LEAVE_EMBED,
   DEFAULT_LEVELUP_EMBED,
} from '../embeds/DefaultEmbeds';

export const defaultServer: Partial<servers> = {
   suggestions_reactions: ['🔼', '🟦', '🔽'],
   join_dm_embed: DEFAULT_JOIN_DM_EMBED as APIEmbed,
   join_embed: DEFAULT_JOIN_EMBED as APIEmbed,
   leave_embed: DEFAULT_LEAVE_EMBED as APIEmbed,
   level_message: { content: '%MEMBER_MENTION%', embed: DEFAULT_LEVELUP_EMBED as APIEmbed },
   disabled_modules: ['Levels'],
   message_xp_range: [20],
   voice_xp_range: [5],
   starboard_xp_range: [50],
   event_xp_range: [100],
   level_rewards: [],
   join_roles: [],
   sticky_roles: [],
   reaction_roles: [],
   starboard_boards: [],
};
