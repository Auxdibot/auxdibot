import { assert } from 'chai';
import * as help from '@/interaction/commands/general/help';
suite('general commands', () => {
   suite('/help', () => {
      test('is defined', () => {
         assert.isDefined(help.default, 'help is defined');
         assert.isDefined(help.default.execute, 'help.execute is defined');
         assert.isFunction(help.default.execute, 'help.execute is a function');
         assert.isDefined(help.default.info, 'help.info is defined');
      });
   });
});
