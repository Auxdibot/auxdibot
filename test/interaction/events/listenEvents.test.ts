import listenEvents from '@/interaction/events/listenEvents';
import { assert } from 'chai';

suite('listenEvents', () => {
   test('is defined', () => {
      assert.isDefined(listenEvents, 'listenEvents is defined');
      assert.isFunction(listenEvents, 'listenEvents is a function');
   });
});
