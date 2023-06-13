import createPunishment from '@/modules/features/moderation/createPunishment';
import { assert } from 'chai';

suite('createPunishment', () => {
   test('is defined', () => {
      assert.isDefined(createPunishment, 'createPunishment is defined');
      assert.isFunction(createPunishment, 'createPunishment is a function');
   });
});
