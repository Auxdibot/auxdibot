import { assert } from 'chai';
import * as embed from '@/interaction/commands/messages/embed';
import * as schedule from '@/interaction/commands/messages/schedule';
suite('embeds commands', () => {
   suite('/embed', () => {
      test('is defined', () => {
         assert.isDefined(embed.default, 'embed is defined');
         assert.isDefined(embed.default.execute, 'embed.execute is defined');
         assert.isFunction(embed.default.execute, 'embed.execute is a function');
         assert.isDefined(embed.default.info, 'embed.info is defined');
      });
   });
   suite('/schedule', () => {
      test('is defined', () => {
         assert.isDefined(schedule.default, 'schedule is defined');
         assert.isDefined(schedule.default.execute, 'schedule.execute is defined');
         assert.isFunction(schedule.default.execute, 'schedule.execute is a function');
         assert.isDefined(schedule.default.info, 'schedule.info is defined');
      });
   });
});
