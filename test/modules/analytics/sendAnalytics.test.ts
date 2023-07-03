import sendAnalytics from '@/modules/analytics/sendAnalytics';
import { assert } from 'chai';

suite('sendAnalytics', () => {
   test('is defined', () => {
      assert.isDefined(sendAnalytics, 'sendAnalytics is defined');
      assert.isFunction(sendAnalytics, 'sendAnalytics is a function');
   });
});
