import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { assert } from 'chai';

suite('findOrCreateServer', () => {
   test('is defined', () => {
      assert.isDefined(findOrCreateServer, 'findOrCreateServer is defined');
      assert.isFunction(findOrCreateServer, 'findOrCreateServer is a function');
   });
});
