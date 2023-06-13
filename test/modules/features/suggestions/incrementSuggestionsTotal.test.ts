import incrementSuggestionsTotal from '@/modules/features/suggestions/incrementSuggestionsTotal';
import { assert } from 'chai';

suite('incrementSuggestionsTotal', () => {
   test('is defined', () => {
      assert.isDefined(incrementSuggestionsTotal, 'incrementSuggestionsTotal is defined');
      assert.isFunction(incrementSuggestionsTotal, 'incrementSuggestionsTotal is a function');
   });
});
