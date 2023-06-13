import updateLog from '@/modules/logs/updateLog';
import { assert } from 'chai';

suite('updateLog', () => {
   test('is defined', () => {
      assert.isDefined(updateLog, 'memberLeave is defined');
      assert.isFunction(updateLog, 'memberLeave is a function');
   });
});
