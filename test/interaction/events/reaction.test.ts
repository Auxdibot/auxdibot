import messageReactionAdd from '@/interaction/events/reaction/messageReactionAdd';
import messageReactionRemove from '@/interaction/events/reaction/messageReactionRemove';
import { assert } from 'chai';

suite('reaction', () => {
   suite('messageReactionAdd', () => {
      test('is defined', () => {
         assert.isDefined(messageReactionAdd, 'messageReactionAdd is defined');
         assert.isFunction(messageReactionAdd, 'messageReactionAdd is a function');
      });
   });
   suite('messageReactionRemove', () => {
      test('is defined', () => {
         assert.isDefined(messageReactionRemove, 'messageReactionRemove is defined');
         assert.isFunction(messageReactionRemove, 'messageReactionRemove is a function');
      });
   });
});
