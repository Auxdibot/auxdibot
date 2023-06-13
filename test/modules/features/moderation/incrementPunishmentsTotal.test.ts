import incrementPunishmentsTotal from '@/modules/features/moderation/incrementPunishmentsTotal';
import { assert } from 'chai';

suite('incrementPunishmentsTotal', () => {
   test('is defined', () => {
      assert.isDefined(incrementPunishmentsTotal, 'incrementPunishmentsTotal is defined');
      assert.isFunction(incrementPunishmentsTotal, 'incrementPunishmentsTotal is a function');
   });
});
