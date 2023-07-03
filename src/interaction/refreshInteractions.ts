import { Auxdibot } from '@/interfaces/Auxdibot';
import { REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';

export default async function refreshInteractions(auxdibot: Auxdibot, rest: REST, CLIENT_ID: string) {
   console.log('-> Declaring commands...');
   const commands = [];
   const PACKAGES = [
      'general',
      'moderation',
      'settings',
      'permissions',
      'messages',
      'roles',
      'suggestions',
      'levels',
      'starboard',
   ];
   const commandFiles = [
      {
         dir: '',
         files: fs.readdirSync(path.join(__dirname, '/commands')).filter((file) => file.endsWith('.js')),
      },
   ];

   for (const packageString of PACKAGES) {
      const packageFile = path.join(__dirname, '/commands', packageString);
      if (fs.existsSync(packageFile)) {
         commandFiles.push({
            dir: packageString,
            files: fs.readdirSync(packageFile).filter((file) => file.endsWith('.js')),
         });
      }
   }
   for (const packageFile of commandFiles) {
      for (const file of packageFile.files) {
         const fileRequire = await import(`./commands/${packageFile.dir}/${file}`);
         if (fileRequire.default.data) {
            commands.push(fileRequire.default.data);
            if (auxdibot.commands) {
               auxdibot.commands.set(fileRequire.default.data.name, fileRequire.default);
            }
         }
      }
   }
   rest
      .put(Routes.applicationCommands(CLIENT_ID), {
         body: commands,
      })
      .then(() => {
         console.log(`-> Refreshed ${commands.length} slash commands.`);
      })
      .catch((x) => {
         console.error('! -> Failed to load commands!');
         console.error(x);
      });

   /********************************************************************************/
   // Declare buttons
   console.log('-> Declaring button interactions...');
   const buttons = [];
   const buttonFiles = fs.readdirSync(path.join(__dirname, '/buttons')).filter((file) => file.endsWith('.js'));
   for (const file of buttonFiles) {
      const fileRequire = await import(`./buttons/${file}`);
      if (fileRequire.default) {
         buttons.push(fileRequire.default);
         if (auxdibot.buttons) {
            auxdibot.buttons.set(fileRequire.default.name, fileRequire.default);
         }
      }
   }
}
