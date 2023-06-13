import messageCreate from '@/interaction/events/message/messageCreate';
import messageDelete from '@/interaction/events/message/messageDelete';
import messageUpdate from '@/interaction/events/message/messageUpdate';
import { assert } from 'chai';

suite('message', () => {
   suite('messageCreate', () => {
      test('is defined', () => {
         assert.isDefined(messageCreate, 'messageCreate is defined');
         assert.isFunction(messageCreate, 'messageCreate is a function');
      });
   });
   suite('messageDelete', () => {
      test('is defined', () => {
         assert.isDefined(messageDelete, 'messageDelete is defined');
         assert.isFunction(messageDelete, 'messageDelete is a function');
      });
   });
   suite('messageUpdate', () => {
      test('is defined', () => {
         assert.isDefined(messageUpdate, 'messageUpdate is defined');
         assert.isFunction(messageUpdate, 'messageUpdate is a function');
      });
   });
});
