import { assert } from 'chai';
import * as ban from '@/interaction/commands/moderation/ban';
import * as kick from '@/interaction/commands/moderation/kick';
import * as mute from '@/interaction/commands/moderation/mute';
import * as punishment from '@/interaction/commands/moderation/punishment';
import * as record from '@/interaction/commands/moderation/record';
import * as unban from '@/interaction/commands/moderation/unban';
import * as unmute from '@/interaction/commands/moderation/unmute';
import * as user from '@/interaction/commands/moderation/user';
import * as warn from '@/interaction/commands/moderation/warn';

suite('moderation commands', () => {
   suite('/ban', () => {
      test('is defined', () => {
         assert.isDefined(ban.default, 'ban is defined');
         assert.isDefined(ban.default.execute, 'ban.execute is defined');
         assert.isFunction(ban.default.execute, 'ban.execute is a function');
         assert.isDefined(ban.default.info, 'ban.info is defined');
      });
   });
   suite('/kick', () => {
      test('is defined', () => {
         assert.isDefined(kick.default, 'kick is defined');
         assert.isDefined(kick.default.execute, 'kick.execute is defined');
         assert.isFunction(kick.default.execute, 'kick.execute is a function');
         assert.isDefined(kick.default.info, 'kick.info is defined');
      });
   });
   suite('/mute', () => {
      test('is defined', () => {
         assert.isDefined(mute.default, 'mute is defined');
         assert.isDefined(mute.default.execute, 'mute.execute is defined');
         assert.isFunction(mute.default.execute, 'mute.execute is a function');
         assert.isDefined(mute.default.info, 'mute.info is defined');
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
   suite('/unban', () => {
      test('is defined', () => {
         assert.isDefined(unban.default, 'unban is defined');
         assert.isDefined(unban.default.execute, 'unban.execute is defined');
         assert.isFunction(unban.default.execute, 'unban.execute is a function');
         assert.isDefined(unban.default.info, 'unban.info is defined');
      });
   });
   suite('/unmute', () => {
      test('is defined', () => {
         assert.isDefined(unmute.default, 'unmute is defined');
         assert.isDefined(unmute.default.execute, 'unmute.execute is defined');
         assert.isFunction(unmute.default.execute, 'unmute.execute is a function');
         assert.isDefined(unmute.default.info, 'unmute.info is defined');
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
   suite('/warn', () => {
      test('is defined', () => {
         assert.isDefined(warn.default, 'warn is defined');
         assert.isDefined(warn.default.execute, 'warn.execute is defined');
         assert.isFunction(warn.default.execute, 'warn.execute is a function');
         assert.isDefined(warn.default.info, 'warn.info is defined');
      });
   });
});
