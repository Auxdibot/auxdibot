import { assert } from 'chai';
import * as join_dm from '@/interaction/commands/settings/join_dm';
import * as join_roles from '@/interaction/commands/settings/join_roles';
import * as sticky_roles from '@/interaction/commands/settings/sticky_roles';
import * as join from '@/interaction/commands/settings/join';
import * as leave from '@/interaction/commands/settings/leave';
import * as modules from '@/interaction/commands/settings/modules';
import * as settings from '@/interaction/commands/settings/settings';

suite('settings commands', () => {
   suite('/join_dm', () => {
      test('is defined', () => {
         assert.isDefined(join_dm.default, 'join_dm is defined');
         assert.isDefined(join_dm.default.execute, 'join_dm.execute is defined');
         assert.isFunction(join_dm.default.execute, 'join_dm.execute is a function');
         assert.isDefined(join_dm.default.info, 'join_dm.info is defined');
      });
   });
   suite('/join_roles', () => {
      test('is defined', () => {
         assert.isDefined(join_roles.default, 'join_roles is defined');
         assert.isDefined(join_roles.default.execute, 'join_roles.execute is defined');
         assert.isFunction(join_roles.default.execute, 'join_roles.execute is a function');
         assert.isDefined(join_roles.default.info, 'join_roles.info is defined');
      });
   });
   suite('/sticky_roles', () => {
      test('is defined', () => {
         assert.isDefined(sticky_roles.default, 'sticky_roles is defined');
         assert.isDefined(sticky_roles.default.execute, 'sticky_roles.execute is defined');
         assert.isFunction(sticky_roles.default.execute, 'sticky_roles.execute is a function');
         assert.isDefined(sticky_roles.default.info, 'sticky_roles.info is defined');
      });
   });
   suite('/join', () => {
      test('is defined', () => {
         assert.isDefined(join.default, 'join is defined');
         assert.isDefined(join.default.execute, 'join.execute is defined');
         assert.isFunction(join.default.execute, 'join.execute is a function');
         assert.isDefined(join.default.info, 'join.info is defined');
      });
   });
   suite('/record', () => {
      test('is defined', () => {
         assert.isDefined(leave.default, 'leave is defined');
         assert.isDefined(leave.default.execute, 'leave.execute is defined');
         assert.isFunction(leave.default.execute, 'leave.execute is a function');
         assert.isDefined(leave.default.info, 'leave.info is defined');
      });
   });
   suite('/modules', () => {
      test('is defined', () => {
         assert.isDefined(modules.default, 'modules is defined');
         assert.isDefined(modules.default.execute, 'modules.execute is defined');
         assert.isFunction(modules.default.execute, 'modules.execute is a function');
         assert.isDefined(modules.default.info, 'modules.info is defined');
      });
   });
   suite('/settings', () => {
      test('is defined', () => {
         assert.isDefined(settings.default, 'settings is defined');
         assert.isDefined(settings.default.execute, 'settings.execute is defined');
         assert.isFunction(settings.default.execute, 'settings.execute is a function');
         assert.isDefined(settings.default.info, 'settings.info is defined');
      });
   });
});
