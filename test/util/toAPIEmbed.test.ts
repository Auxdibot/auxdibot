import { toAPIEmbed } from '@/util/toAPIEmbed';
import { assert } from 'chai';

suite('toAPIEmbed', () => {
   test('is defined', () => {
      assert.isDefined(toAPIEmbed, 'toAPIEmbed is defined');
      assert.isFunction(toAPIEmbed, 'toAPIEmbed is a function');
   });
});
