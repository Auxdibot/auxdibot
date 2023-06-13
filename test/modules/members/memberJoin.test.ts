import memberJoin from '@/modules/members/memberJoin';
import { assert } from 'chai';

suite('memberJoin', () => {
   test('is defined', () => {
      assert.isDefined(memberJoin, 'memberJoin is defined');
      assert.isFunction(memberJoin, 'memberJoin is a function');
   });
});
