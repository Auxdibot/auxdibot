import resetXP from '@/modules/features/levels/resetXP';
import { assert } from 'chai';

suite('resetXP', () => {
   test('is defined', () => {
      assert.isDefined(resetXP, 'resetXP is defined');
      assert.isFunction(resetXP, 'resetXP is a function');
   });
});
