import buttonCreate from '@/interaction/events/interaction/buttonCreate';
import slashCreate from '@/interaction/events/interaction/slashCreate';
import { assert } from 'chai';

suite('interaction', () => {
   suite('slashCreate', () => {
      test('is defined', () => {
         assert.isDefined(slashCreate, 'slashCreate is defined');
         assert.isFunction(slashCreate, 'slashCreate is a function');
      });
   });
   suite('buttonCreate', () => {
      test('is defined', () => {
         assert.isDefined(buttonCreate, 'buttonCreate is defined');
         assert.isFunction(buttonCreate, 'buttonCreate is a function');
      });
   });
});
