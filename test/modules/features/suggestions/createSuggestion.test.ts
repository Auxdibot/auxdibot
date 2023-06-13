import createSuggestion from '@/modules/features/suggestions/createSuggestion';
import { assert } from 'chai';

suite('createSuggestion', () => {
   test('is defined', () => {
      assert.isDefined(createSuggestion, 'createSuggestion is defined');
      assert.isFunction(createSuggestion, 'createSuggestion is a function');
   });
});
