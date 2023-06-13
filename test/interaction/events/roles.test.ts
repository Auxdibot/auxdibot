import roleDelete from '@/interaction/events/roles/roleDelete';
import { assert } from 'chai';

suite('roles', () => {
   suite('roleDelete', () => {
      test('is defined', () => {
         assert.isDefined(roleDelete, 'roleDelete is defined');
         assert.isFunction(roleDelete, 'roleDelete is a function');
      });
   });
});
