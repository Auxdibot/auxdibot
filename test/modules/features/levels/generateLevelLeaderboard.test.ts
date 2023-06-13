import generateLevelLeaderboard from '@/modules/features/levels/generateLevelLeaderboard';
import { assert } from 'chai';

suite('generateLevelLeaderboard', () => {
   test('is defined', () => {
      assert.isDefined(generateLevelLeaderboard, 'generateLevelLeaderboard is defined');
      assert.isFunction(generateLevelLeaderboard, 'generateLevelLeaderboard is a function');
   });
});
