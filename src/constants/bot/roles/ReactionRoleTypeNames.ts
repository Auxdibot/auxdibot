import { ReactionRoleType } from '@prisma/client';

export const ReactionRoleTypeNames: { [k in ReactionRoleType]: string } = {
   BUTTON: '🔼 Discord Button',
   BUTTON_SELECT_ONE: '🔼 Discord Button (Select One)',
   DEFAULT: '🔍 Default',
   STICKY: '🔍 Sticky',
   SELECT_ONE: '🔍 Select One',
   SELECT_MENU: '📃 Select Menu',
   SELECT_ONE_MENU: '📃 Select Menu (Select One)',
};
