import onReady from '@/interaction/events/client/onReady';
import { assert } from 'chai';

suite('client', () => {
   suite('onReady', () => {
      test('is defined', () => {
         assert.isDefined(onReady, 'onReady is defined');
         assert.isFunction(onReady, 'onReady is a function');
      });
   });
});
