import testPermission from '@/util/testPermission';
import { assert } from 'chai';

suite('testPermission', () => {
   test('is defined', () => {
      assert.isDefined(testPermission, 'testPermission is defined');
      assert.isFunction(testPermission, 'testPermission is a function');
   });
});
