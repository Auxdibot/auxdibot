import { assert } from 'chai';
import * as punish from '@/interaction/commands/moderation/punish';
import * as punishment from '@/interaction/commands/moderation/punishment';
import * as record from '@/interaction/commands/moderation/record';
import * as user from '@/interaction/commands/moderation/user';

suite('moderation commands', () => {
   suite('/punish', () => {
      test('is defined', () => {
         assert.isDefined(punish.default, 'punish is defined');
         assert.isDefined(punish.default.execute, 'punish.execute is defined');
         assert.isFunction(punish.default.execute, 'punish.execute is a function');
         assert.isDefined(punish.default.info, 'punish.info is defined');
      });
   });
   suite('/punishment', () => {
      test('is defined', () => {
         assert.isDefined(punishment.default, 'punishment is defined');
         assert.isDefined(punishment.default.execute, 'punishment.execute is defined');
         assert.isFunction(punishment.default.execute, 'punishment.execute is a function');
         assert.isDefined(punishment.default.info, 'punishment.info is defined');
      });
   });
   suite('/record', () => {
      test('is defined', () => {
         assert.isDefined(record.default, 'record is defined');
         assert.isDefined(record.default.execute, 'record.execute is defined');
         assert.isFunction(record.default.execute, 'record.execute is a function');
         assert.isDefined(record.default.info, 'record.info is defined');
      });
   });
   suite('/user', () => {
      test('is defined', () => {
         assert.isDefined(user.default, 'user is defined');
         assert.isDefined(user.default.execute, 'user.execute is defined');
         assert.isFunction(user.default.execute, 'user.execute is a function');
         assert.isDefined(user.default.info, 'user.info is defined');
      });
   });
});
