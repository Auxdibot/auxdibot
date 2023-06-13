import { testLimit } from '@/util/testLimit';
import { assert } from 'chai';

suite('testLimit', () => {
   test('is defined', () => {
      assert.isDefined(testLimit, 'testLimit is defined');
      assert.isFunction(testLimit, 'testLimit is a function');
   });
});
