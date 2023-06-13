import updateStarredMessage from '@/modules/features/starboard/updateStarredMessage';
import { assert } from 'chai';

suite('updateStarredMessage', () => {
   test('is defined', () => {
      assert.isDefined(updateStarredMessage, 'updateStarredMessage is defined');
      assert.isFunction(updateStarredMessage, 'updateStarredMessage is a function');
   });
});
