import scheduleAnalyticsSend from '@/modules/analytics/scheduleAnalyticsSend';
import { assert } from 'chai';

suite('scheduleAnalyticsSend', () => {
   test('is defined', () => {
      assert.isDefined(scheduleAnalyticsSend, 'scheduleAnalyticsSend is defined');
      assert.isFunction(scheduleAnalyticsSend, 'scheduleAnalyticsSend is a function');
   });
});
