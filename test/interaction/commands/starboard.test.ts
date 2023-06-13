import { assert } from 'chai';
import * as starboard from '@/interaction/commands/starboard/starboard';
suite('starboard commands', () => {
   suite('/starboard', () => {
      test('is defined', () => {
         assert.isDefined(starboard.default, 'starboard is defined');
         assert.isDefined(starboard.default.execute, 'starboard.execute is defined');
         assert.isFunction(starboard.default.execute, 'starboard.execute is a function');
         assert.isDefined(starboard.default.info, 'starboard.info is defined');
      });
   });
});
