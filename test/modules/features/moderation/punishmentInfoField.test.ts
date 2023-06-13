import { punishmentInfoField } from '@/modules/features/moderation/punishmentInfoField';
import { assert } from 'chai';

suite('punishmentInfoField', () => {
   test('is defined', () => {
      assert.isDefined(punishmentInfoField, 'punishmentInfoField is defined');
      assert.isFunction(punishmentInfoField, 'punishmentInfoField is a function');
   });
});
