import { assert } from 'chai';
import * as reaction_roles from '@/interaction/commands/roles/reaction_roles';
import * as massrole from '@/interaction/commands/roles/massrole';
suite('roles commands', () => {
   suite('/reaction_roles', () => {
      test('is defined', () => {
         assert.isDefined(reaction_roles.default, 'reaction_roles is defined');
         assert.isDefined(reaction_roles.default.execute, 'reaction_roles.execute is defined');
         assert.isFunction(reaction_roles.default.execute, 'reaction_roles.execute is a function');
         assert.isDefined(reaction_roles.default.info, 'reaction_roles.info is defined');
      });
   });
   suite('/massrole', () => {
      test('is defined', () => {
         assert.isDefined(massrole.default, 'massrole is defined');
         assert.isDefined(massrole.default.execute, 'massrole.execute is defined');
         assert.isFunction(massrole.default.execute, 'massrole.execute is a function');
         assert.isDefined(massrole.default.info, 'massrole.info is defined');
      });
   });
});
