import deleteStarredMessage from '@/modules/features/starboard/deleteStarredMessage';
import { assert } from 'chai';

suite('deleteStarredMessage', () => {
   test('is defined', () => {
      assert.isDefined(deleteStarredMessage, 'deleteStarredMessage is defined');
      assert.isFunction(deleteStarredMessage, 'deleteStarredMessage is a function');
   });
});
