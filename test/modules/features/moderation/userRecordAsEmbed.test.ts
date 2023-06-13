import userRecordAsEmbed from '@/modules/features/moderation/userRecordAsEmbed';
import { assert } from 'chai';

suite('userRecordAsEmbed', () => {
   test('is defined', () => {
      assert.isDefined(userRecordAsEmbed, 'userRecordAsEmbed is defined');
      assert.isFunction(userRecordAsEmbed, 'userRecordAsEmbed is a function');
   });
});
