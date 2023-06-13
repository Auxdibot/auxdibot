import argumentsToEmbedParameters from '@/util/argumentsToEmbedParameters';
import { assert } from 'chai';

suite('argumentsToEmbedParameters', () => {
   test('is defined', () => {
      assert.isDefined(argumentsToEmbedParameters, 'argumentsToEmbedParameters is defined');
      assert.isFunction(argumentsToEmbedParameters, 'argumentsToEmbedParameters is a function');
   });
});
