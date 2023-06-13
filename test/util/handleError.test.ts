import handleError from '@/util/handleError';
import { assert } from 'chai';

suite('handleError', () => {
   test('is defined', () => {
      assert.isDefined(handleError, 'handleError is defined');
      assert.isFunction(handleError, 'handleError is a function');
   });
});
