import canExecute from '@/util/canExecute';
import { assert } from 'chai';

suite('canExecute', () => {
   test('is defined', () => {
      assert.isDefined(canExecute, 'canExecute is defined');
      assert.isFunction(canExecute, 'canExecute is a function');
   });
});
