import timestampToDuration from '@/util/timestampToDuration';
import { assert } from 'chai';

suite('timestampToDuration', () => {
   test('is defined', () => {
      assert.isDefined(timestampToDuration, 'timestampToDuration is defined');
      assert.isFunction(timestampToDuration, 'timestampToDuration is a function');
   });
});
