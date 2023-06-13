import scheduleExpirationChecks from '@/modules/features/moderation/scheduleExpirationChecks';
import { assert } from 'chai';

suite('scheduleExpirationChecks', () => {
   test('is defined', () => {
      assert.isDefined(scheduleExpirationChecks, 'scheduleExpirationChecks is defined');
      assert.isFunction(scheduleExpirationChecks, 'scheduleExpirationChecks is a function');
   });
});
