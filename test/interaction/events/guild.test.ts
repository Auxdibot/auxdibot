import guildCreate from '@/interaction/events/guild/guildCreate';
import guildDelete from '@/interaction/events/guild/guildDelete';
import guildMemberAdd from '@/interaction/events/guild/guildMemberAdd';
import guildMemberRemove from '@/interaction/events/guild/guildMemberRemove';
import { assert } from 'chai';

suite('guild', () => {
   suite('guildCreate', () => {
      test('is defined', () => {
         assert.isDefined(guildCreate, 'guildCreate is defined');
         assert.isFunction(guildCreate, 'guildCreate is a function');
      });
   });
   suite('guildDelete', () => {
      test('is defined', () => {
         assert.isDefined(guildDelete, 'guildDelete is defined');
         assert.isFunction(guildDelete, 'guildDelete is a function');
      });
   });
   suite('guildMemberAdd', () => {
      test('is defined', () => {
         assert.isDefined(guildMemberAdd, 'guildMemberAdd is defined');
         assert.isFunction(guildMemberAdd, 'guildMemberAdd is a function');
      });
   });
   suite('guildMemberRemove', () => {
      test('is defined', () => {
         assert.isDefined(guildMemberRemove, 'guildMemberRemove is defined');
         assert.isFunction(guildMemberRemove, 'guildMemberRemove is a function');
      });
   });
});
