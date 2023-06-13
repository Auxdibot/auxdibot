import memberLeave from '@/modules/members/memberLeave';
import { assert } from 'chai';

suite('memberLeave', () => {
   test('is defined', () => {
      assert.isDefined(memberLeave, 'memberLeave is defined');
      assert.isFunction(memberLeave, 'memberLeave is a function');
   });
});
