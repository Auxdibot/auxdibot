import { getMessage } from '@/util/getMessage';
import { assert } from 'chai';

suite('getMessage', () => {
   test('is defined', () => {
      assert.isDefined(getMessage, 'getMessage is defined');
      assert.isFunction(getMessage, 'getMessage is a function');
   });
});
