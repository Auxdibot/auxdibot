import takeXP from '@/modules/features/levels/takeXP';
import { assert } from 'chai';

suite('takeXP', () => {
   test('is defined', () => {
      assert.isDefined(takeXP, 'takeXP is defined');
      assert.isFunction(takeXP, 'takeXP is a function');
   });
});
