import { assert } from 'chai';
import * as ban from '@/interaction/buttons/ban';
import * as kick from '@/interaction/buttons/kick';
import * as mute from '@/interaction/buttons/mute';
import * as record from '@/interaction/buttons/record';
import * as unban from '@/interaction/buttons/unban';
import * as unmute from '@/interaction/buttons/unmute';

suite('buttons', () => {
   suite('ban', () => {
      test('is defined', () => {
         assert.isDefined(ban.default, 'ban is defined');
         assert.isDefined(ban.default.execute, 'ban.execute is defined');
         assert.isFunction(ban.default.execute, 'ban.execute is a function');
      });
   });
   suite('kick', () => {
      test('is defined', () => {
         assert.isDefined(kick.default, 'kick is defined');
         assert.isDefined(kick.default.execute, 'kick.execute is defined');
         assert.isFunction(kick.default.execute, 'kick.execute is a function');
      });
   });
   suite('mute', () => {
      test('is defined', () => {
         assert.isDefined(mute.default, 'mute is defined');
         assert.isDefined(mute.default.execute, 'mute.execute is defined');
         assert.isFunction(mute.default.execute, 'mute.execute is a function');
      });
   });
   suite('record', () => {
      test('is defined', () => {
         assert.isDefined(record.default, 'record is defined');
         assert.isDefined(record.default.execute, 'record.execute is defined');
         assert.isFunction(record.default.execute, 'record.execute is a function');
      });
   });
   suite('unban', () => {
      test('is defined', () => {
         assert.isDefined(unban.default, 'unban is defined');
         assert.isDefined(unban.default.execute, 'unban.execute is defined');
         assert.isFunction(unban.default.execute, 'unban.execute is a function');
      });
   });
   suite('unmute', () => {
      test('is defined', () => {
         assert.isDefined(unmute.default, 'unmute is defined');
         assert.isDefined(unmute.default.execute, 'unmute.execute is defined');
         assert.isFunction(unmute.default.execute, 'unmute.execute is a function');
      });
   });
});
