import deleteSuggestion from '@/modules/features/suggestions/deleteSuggestion';
import { assert } from 'chai';

suite('deleteSuggestion', () => {
   test('is defined', () => {
      assert.isDefined(deleteSuggestion, 'deleteSuggestion is defined');
      assert.isFunction(deleteSuggestion, 'deleteSuggestion is a function');
   });
});
