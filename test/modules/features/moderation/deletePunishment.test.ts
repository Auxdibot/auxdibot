import deletePunishment from '@/modules/features/moderation/deletePunishment';
import { assert } from 'chai';

suite('deletePunishment', () => {
   test('is defined', () => {
      assert.isDefined(deletePunishment, 'deletePunishment is defined');
      assert.isFunction(deletePunishment, 'deletePunishment is a function');
   });
});
