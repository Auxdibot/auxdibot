import handleLog from '@/util/handleLog';
import { assert } from 'chai';

suite('handleLog', () => {
   test('is defined', () => {
      assert.isDefined(handleLog, 'handleLog is defined');
      assert.isFunction(handleLog, 'handleLog is a function');
   });
});
