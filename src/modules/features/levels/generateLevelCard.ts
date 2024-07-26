import { User } from 'discord.js';
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import { join } from 'path';
import { abbreviateNumber } from '../../../util/abbreviateNumber';
import { calculateLevel } from './calculateLevel';
import calcXP from '@/util/calcXP';
GlobalFonts.registerFromPath(join(__dirname, '..', '..', '..', '..', 'fonts', 'Montserrat-Light.ttf'), 'Montserrat');
GlobalFonts.registerFromPath(join(__dirname, '..', '..', '..', '..', 'fonts', 'Raleway-Medium.ttf'), 'Raleway');
export async function generateLevelCard(user: User, xp: number, leaderboard: number): Promise<Buffer> {
   const level = calculateLevel(xp);
   const nextLevelXP = Math.round(calcXP(level + 1)) - calcXP(level);
   const xpTill = xp - calcXP(level);
   const canvas = createCanvas(1200, 400);
   const ctx = canvas.getContext('2d');
   /*
   Create outside border of card
   */
   ctx.save();
   ctx.beginPath();
   const borderRadius = 20;
   ctx.moveTo(borderRadius, 0);
   ctx.lineTo(canvas.width - borderRadius, 0);
   ctx.arcTo(canvas.width, 0, canvas.width, borderRadius, borderRadius);
   ctx.lineTo(canvas.width, canvas.height - borderRadius);
   ctx.arcTo(canvas.width, canvas.height, canvas.width - borderRadius, canvas.height, borderRadius);
   ctx.lineTo(borderRadius, canvas.height);
   ctx.arcTo(0, canvas.height, 0, canvas.height - borderRadius, borderRadius);
   ctx.lineTo(0, borderRadius);
   ctx.arcTo(0, 0, borderRadius, 0, borderRadius);
   ctx.closePath();
   ctx.clip();

   const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
   gradient.addColorStop(0, '#FF0000');
   gradient.addColorStop(1, '#FFA500');
   ctx.fillStyle = gradient;

   ctx.lineWidth = 20;
   ctx.fillRect(0, 0, canvas.width, canvas.height);

   ctx.restore();
   /*
   Create inside of card
   */
   ctx.save();
   const g = ctx.createLinearGradient(
      20,
      20,
      1180 * Math.cos((30 * Math.PI) / 180),
      380 * Math.sin((30 * Math.PI) / 180),
   );
   g.addColorStop(0, '#000000');
   g.addColorStop(1, '#222222');
   ctx.fillStyle = g;

   ctx.beginPath();
   ctx.moveTo(20 + borderRadius, 20);
   ctx.lineTo(canvas.width - 20 - borderRadius, 20);
   ctx.arcTo(canvas.width - 20, 20, canvas.width - 20, 20 + borderRadius, borderRadius);
   ctx.lineTo(canvas.width - 20, canvas.height - 20 - borderRadius);
   ctx.arcTo(canvas.width - 20, canvas.height - 20, canvas.width - 20 - borderRadius, canvas.height - 20, borderRadius);
   ctx.lineTo(20 + borderRadius, canvas.height - 20);
   ctx.arcTo(20, canvas.height - 20, 20, canvas.height - 20 - borderRadius, borderRadius);
   ctx.lineTo(20, 20 + borderRadius);
   ctx.arcTo(20, 20, 20 + borderRadius, 20, borderRadius);
   ctx.closePath();
   ctx.fill();

   ctx.restore();
   /*
   Create user avatar for card
   */
   ctx.save();

   const avatar = await loadImage(user.avatarURL({ size: 256 }));
   const avatarY = (canvas.height - avatar.height) / 2;
   const avatarX = 50;
   ctx.beginPath();
   ctx.arc(avatarX + avatar.width / 2, avatarY + avatar.height / 2, avatar.width / 2, 0, Math.PI * 2, true);
   ctx.closePath();
   ctx.clip();
   ctx.strokeStyle = '#dddddd';
   ctx.lineWidth = 7;
   ctx.drawImage(avatar, avatarX, avatarY, avatar.width, avatar.height);
   ctx.stroke();
   ctx.restore();
   /*
   Create username text
   */
   ctx.save();
   ctx.font = 'light 5rem Montserrat';
   ctx.font;
   ctx.fillStyle = '#ffffff';
   ctx.textAlign = 'left';
   const username = user.username.length > 16 ? user.username.slice(0, 16) + '...' : user.username;
   ctx.fillText(username, avatarX + avatar.width + 40, canvas.height / 2 + 20);
   ctx.restore();
   /*
   Create progress bar
   */
   ctx.save();
   const progressBarWidth = 800;
   const progressBarHeight = 50;
   const progressBarX = avatarX + avatar.width + 40;
   const progressBarY = canvas.height / 2 + 50;

   const progress = xpTill / nextLevelXP;
   const progressWidth = progressBarWidth * progress;
   ctx.beginPath();
   ctx.moveTo(progressBarX + borderRadius, progressBarY);
   ctx.lineTo(progressBarX + progressBarWidth - borderRadius, progressBarY);
   ctx.arcTo(
      progressBarX + progressBarWidth,
      progressBarY,
      progressBarX + progressBarWidth,
      progressBarY + borderRadius,
      borderRadius,
   );
   ctx.lineTo(progressBarX + progressBarWidth, progressBarY + progressBarHeight - borderRadius);
   ctx.arcTo(
      progressBarX + progressBarWidth,
      progressBarY + progressBarHeight,
      progressBarX + progressBarWidth - borderRadius,
      progressBarY + progressBarHeight,
      borderRadius,
   );
   ctx.lineTo(progressBarX + borderRadius, progressBarY + progressBarHeight);
   ctx.arcTo(
      progressBarX,
      progressBarY + progressBarHeight,
      progressBarX,
      progressBarY + progressBarHeight - borderRadius,
      borderRadius,
   );
   ctx.lineTo(progressBarX, progressBarY + borderRadius);
   ctx.arcTo(progressBarX, progressBarY, progressBarX + borderRadius, progressBarY, borderRadius);
   ctx.closePath();
   ctx.clip();
   ctx.fillStyle = '#444444';

   ctx.fillRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);
   const barGradient = ctx.createLinearGradient(progressBarX, progressBarY, progressBarWidth, progressBarHeight);
   barGradient.addColorStop(0, '#FF0000');
   barGradient.addColorStop(0.8, '#C87D48');
   barGradient.addColorStop(1, '#FFA500');
   ctx.beginPath();
   ctx.moveTo(progressBarX + borderRadius, progressBarY);
   ctx.lineTo(progressBarX + progressWidth - borderRadius, progressBarY);
   ctx.arcTo(
      progressBarX + progressWidth,
      progressBarY,
      progressBarX + progressWidth,
      progressBarY + borderRadius,
      borderRadius,
   );
   ctx.lineTo(progressBarX + progressWidth, progressBarY + progressBarHeight - borderRadius);
   ctx.arcTo(
      progressBarX + progressWidth,
      progressBarY + progressBarHeight,
      progressBarX + progressWidth - borderRadius,
      progressBarY + progressBarHeight,
      borderRadius,
   );
   ctx.lineTo(progressBarX + borderRadius, progressBarY + progressBarHeight);
   ctx.arcTo(
      progressBarX,
      progressBarY + progressBarHeight,
      progressBarX,
      progressBarY + progressBarHeight - borderRadius,
      borderRadius,
   );
   ctx.lineTo(progressBarX, progressBarY + borderRadius);
   ctx.arcTo(progressBarX, progressBarY, progressBarX + borderRadius, progressBarY, borderRadius);
   ctx.closePath();
   ctx.clip();
   ctx.fillStyle = barGradient;
   ctx.fillRect(progressBarX, progressBarY, progressWidth, progressBarHeight);
   ctx.restore();
   /*
   Create Total XP text
   */
   ctx.save();

   const totalXP = abbreviateNumber(xp);
   ctx.font = '2rem Montserrat';
   ctx.fillStyle = '#ffffff';
   ctx.textAlign = 'left';
   ctx.fillText(`${totalXP} XP Total`, progressBarX + 10, progressBarY + progressBarHeight + 40);
   ctx.restore();
   ctx.save();
   /*
   Create XP till next level text
   */
   const abbreviatedXpTill = abbreviateNumber(xpTill);
   const abbreviatedNextLevelXP = abbreviateNumber(nextLevelXP);
   ctx.font = 'bold 2rem Montserrat';
   ctx.fillStyle = '#ffffff';
   ctx.textAlign = 'left';

   ctx.fillText(
      `${abbreviatedXpTill}`,
      progressBarX + progressBarWidth - ctx.measureText(`${abbreviatedXpTill} / ${abbreviatedNextLevelXP} XP`).width,
      progressBarY + progressBarHeight + 40,
   );
   ctx.font = '2rem Montserrat';
   ctx.fillText(
      ` / ${abbreviatedNextLevelXP} XP`,
      progressBarX + progressBarWidth - ctx.measureText(` / ${abbreviatedNextLevelXP} XP`).width,
      progressBarY + progressBarHeight + 40,
   );
   /*
   Create Level text
   */
   ctx.restore();
   ctx.save();
   ctx.font = 'light 2.5rem Montserrat';
   ctx.fillStyle = '#ffffff';
   ctx.textAlign = 'center';
   ctx.fillText('Level', canvas.width - 100, 60);
   ctx.font = 'bold 4rem Montserrat';
   ctx.fillText(level.toString(), canvas.width - 96, 125);
   ctx.restore();
   /*
   Create leaderboard rank text
   */
   ctx.save();
   ctx.font = 'light 2.5rem Montserrat';
   ctx.fillStyle = '#ffffff';
   ctx.textAlign = 'center';
   ctx.fillText('Rank', canvas.width - 250, 60);
   ctx.font = 'bold 4rem Montserrat';
   switch (leaderboard) {
      case 1:
         ctx.fillStyle = '#FFD700';
         break;
      case 2:
         ctx.fillStyle = '#C0C0C0';
         break;
      case 3:
         ctx.fillStyle = '#CD7F32';
         break;
      default:
         ctx.fillStyle = '#cccccc';
         break;
   }
   ctx.fillText(`#${leaderboard.toString()}`, canvas.width - 246, 125);

   const pngData = await canvas.encode('png');
   return pngData;
}
