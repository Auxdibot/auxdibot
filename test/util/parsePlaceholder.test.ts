import parsePlaceholder from '@/util/parsePlaceholder';
import { assert } from 'chai';

suite('parsePlaceholder', () => {
   test('is defined', () => {
      assert.isDefined(parsePlaceholder, 'parsePlaceholder is defined');
      assert.isFunction(parsePlaceholder, 'parsePlaceholder is a function');
   });
});
