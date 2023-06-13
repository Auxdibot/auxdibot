import updateSuggestion from '@/modules/features/suggestions/updateSuggestion';
import { assert } from 'chai';

suite('updateSuggestion', () => {
   test('is defined', () => {
      assert.isDefined(updateSuggestion, 'createSuggestion is defined');
      assert.isFunction(updateSuggestion, 'createSuggestion is a function');
   });
});
