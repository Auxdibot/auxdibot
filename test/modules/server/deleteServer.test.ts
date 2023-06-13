import deleteServer from '@/modules/server/deleteServer';
import { assert } from 'chai';

suite('deleteServer', () => {
   test('is defined', () => {
      assert.isDefined(deleteServer, 'deleteServer is defined');
      assert.isFunction(deleteServer, 'deleteServer is a function');
   });
});
