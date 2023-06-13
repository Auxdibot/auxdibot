import { assert } from 'chai';
import * as permissions from '@/interaction/commands/permissions/permissions';
suite('permissions commands', () => {
   suite('/permissions', () => {
      test('is defined', () => {
         assert.isDefined(permissions.default, 'permissions is defined');
         assert.isDefined(permissions.default.execute, 'permissions.execute is defined');
         assert.isFunction(permissions.default.execute, 'permissions.execute is a function');
         assert.isDefined(permissions.default.info, 'permissions.info is defined');
      });
   });
});
