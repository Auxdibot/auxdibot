import { assert } from 'chai';
import * as embed from '@/interaction/commands/embeds/embed';
suite('embeds commands', () => {
   suite('/embed', () => {
      test('is defined', () => {
         assert.isDefined(embed.default, 'embed is defined');
         assert.isDefined(embed.default.execute, 'embed.execute is defined');
         assert.isFunction(embed.default.execute, 'embed.execute is a function');
         assert.isDefined(embed.default.info, 'embed.info is defined');
      });
   });
});
