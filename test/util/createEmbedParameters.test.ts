import createEmbedParameters from '@/util/createEmbedParameters';
import { assert } from 'chai';

suite('createEmbedParameters', () => {
   test('is defined', () => {
      assert.isDefined(createEmbedParameters, 'createEmbedParameters is defined');
      assert.isFunction(createEmbedParameters, 'createEmbedParameters is a function');
   });
});
