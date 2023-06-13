import createStarredMessage from '@/modules/features/starboard/createStarredMessage';
import { assert } from 'chai';

suite('createStarredMessage', () => {
   test('is defined', () => {
      assert.isDefined(createStarredMessage, 'createStarredMessage is defined');
      assert.isFunction(createStarredMessage, 'createStarredMessage is a function');
   });
});
