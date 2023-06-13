import connectPrisma from '@/modules/database/connectPrisma';
import { assert } from 'chai';

suite('connectPrisma', () => {
   test('is defined', () => {
      assert.isDefined(connectPrisma, 'connectPrisma is defined');
      assert.isFunction(connectPrisma, 'connectPrisma is a function');
   });
});
