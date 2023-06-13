import calcXP from '@/util/calcXP';
import { assert } from 'chai';

suite('calcXP', () => {
   test('is defined', () => {
      assert.isDefined(calcXP, 'calcXP is defined');
      assert.isFunction(calcXP, 'calcXP is a function');
   });
});
