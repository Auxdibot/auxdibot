import refreshInteractions from '@/interaction/refreshInteractions';
import { assert } from 'chai';

suite('refreshInteractions', () => {
   test('is defined', () => {
      assert.isDefined(refreshInteractions, 'refreshInteractions is defined');
      assert.isFunction(refreshInteractions, 'refreshInteractions is a function');
   });
});
