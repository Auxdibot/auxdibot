import { assert } from 'chai';

suite('auxdibot.log', () => {
   test('is defined', () => {
      assert.isDefined(auxdibot.log, 'auxdibot.log is defined');
      assert.isFunction(auxdibot.log, 'auxdibot.log is a function');
   });
});
