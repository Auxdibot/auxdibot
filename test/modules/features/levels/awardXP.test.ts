import awardXP from '@/modules/features/levels/awardXP';
import { assert } from 'chai';

suite('awardXP', () => {
   test('is defined', () => {
      assert.isDefined(awardXP, 'awardXP is defined');
      assert.isFunction(awardXP, 'awardXP is a function');
   });
});
