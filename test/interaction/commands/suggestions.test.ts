import { assert } from 'chai';
import * as suggestions from '@/interaction/commands/suggestions/suggestions';
suite('suggestions commands', () => {
   suite('/suggestions', () => {
      test('is defined', () => {
         assert.isDefined(suggestions.default, 'suggestions is defined');
         assert.isDefined(suggestions.default.execute, 'suggestions.execute is defined');
         assert.isFunction(suggestions.default.execute, 'suggestions.execute is a function');
         assert.isDefined(suggestions.default.info, 'suggestions.info is defined');
      });
   });
});
