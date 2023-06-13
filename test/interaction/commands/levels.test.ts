import { assert } from 'chai';
import * as levels from '@/interaction/commands/levels/levels';
suite('levels commands', () => {
   suite('/levels', () => {
      test('is defined', () => {
         assert.isDefined(levels.default, 'levels is defined');
         assert.isDefined(levels.default.execute, 'levels.execute is defined');
         assert.isFunction(levels.default.execute, 'levels.execute is a function');
         assert.isDefined(levels.default.info, 'levels.info is defined');
      });
   });
});
