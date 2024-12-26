import { servers } from '@prisma/client';

/**
 * Represents the options for an Auxdibot reply.
 */
export interface AuxdibotReplyOptions {
   noOutputChannel?: boolean;
   data?: servers;
}
