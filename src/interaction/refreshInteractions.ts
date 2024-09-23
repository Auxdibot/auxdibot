import { Auxdibot } from '@/Auxdibot';
import { REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';

const isCommandFile = (file: string) =>
   file.endsWith('.js') || (process.env.NODE_ENV == 'DEVELOPMENT' && file.endsWith('.ts'));
export default async function refreshInteractions(auxdibot: Auxdibot, rest: REST, CLIENT_ID: string) {
   console.log('-> Declaring application commands...');
   const commands = [];
   const PACKAGES = [
      'general',
      'moderation',
      'settings',
      'messages',
      'roles',
      'suggestions',
      'levels',
      'starboard',
      'greetings',
   ];
   const commandFiles = [
      {
         dir: '',
         files: fs.readdirSync(path.join(__dirname, '/commands')).filter(isCommandFile),
      },
   ];

   for (const packageString of PACKAGES) {
      const packageFile = path.join(__dirname, '/commands', packageString);
      if (fs.existsSync(packageFile)) {
         commandFiles.push({
            dir: packageString,
            files: fs.readdirSync(packageFile).filter(isCommandFile),
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
   const contextMenuFiles = [
      {
         dir: '',
         files: fs.readdirSync(path.join(__dirname, '/contexts')).filter(isCommandFile),
      },
   ];
   for (const packageString of PACKAGES) {
      const packageFile = path.join(__dirname, '/contexts', packageString);
      if (fs.existsSync(packageFile)) {
         contextMenuFiles.push({ dir: packageString, files: fs.readdirSync(packageFile).filter(isCommandFile) });
      }
   }
   for (const packageFile of contextMenuFiles) {
      for (const file of packageFile.files) {
         const fileRequire = await import(`./contexts/${packageFile.dir}/${file}`);
         if (fileRequire.default.data) {
            commands.push(fileRequire.default.data);
            if (auxdibot.context_menus) {
               auxdibot.context_menus.set(fileRequire.default.data?.name, fileRequire.default);
            }
         }
      }
   }
   rest
      .put(Routes.applicationCommands(CLIENT_ID), {
         body: commands,
      })
      .then(() => {
         console.log(`-> Refreshed ${commands.length} application commands.`);
      })
      .catch((x) => {
         console.error('! -> Failed to load commands!');
         console.error(x);
      });

   /********************************************************************************/
   // Declare buttons
   console.log('-> Declaring button interactions...');
   const buttonFiles = [
      {
         dir: '',
         files: fs.readdirSync(path.join(__dirname, '/buttons')).filter(isCommandFile),
      },
   ];
   for (const packageString of PACKAGES) {
      const packageFile = path.join(__dirname, '/buttons', packageString);
      if (fs.existsSync(packageFile)) {
         buttonFiles.push({ dir: packageString, files: fs.readdirSync(packageFile).filter(isCommandFile) });
      }
   }
   for (const packageFile of buttonFiles) {
      for (const file of packageFile.files) {
         const fileRequire = await import(`./buttons/${packageFile.dir}/${file}`);
         if (auxdibot.buttons) {
            auxdibot.buttons.set(fileRequire.default.name, fileRequire.default);
         }
      }
   }
   console.log(`-> Refreshed ${auxdibot.buttons.size} buttons.`);
   /********************************************************************************/
   // Declare select menus
   console.log('-> Declaring select menu interactions...');
   const selectMenuFiles = [
      {
         dir: '',
         files: fs.readdirSync(path.join(__dirname, '/menus')).filter(isCommandFile),
      },
   ];
   for (const packageString of PACKAGES) {
      const packageFile = path.join(__dirname, '/menus', packageString);
      if (fs.existsSync(packageFile)) {
         selectMenuFiles.push({ dir: packageString, files: fs.readdirSync(packageFile).filter(isCommandFile) });
      }
   }
   for (const packageFile of selectMenuFiles) {
      for (const file of packageFile.files) {
         const fileRequire = await import(`./menus/${packageFile.dir}/${file}`);
         if (auxdibot.select_menus) {
            auxdibot.select_menus.set(fileRequire.default.name, fileRequire.default);
         }
      }
   }
   console.log(`-> Refreshed ${auxdibot.select_menus.size} select menus.`);
   /********************************************************************************/
   // Declare modals
   console.log('-> Declaring modal interactions...');
   const modalFiles = [
      {
         dir: '',
         files: fs.readdirSync(path.join(__dirname, '/modals')).filter(isCommandFile),
      },
   ];
   for (const packageString of PACKAGES) {
      const packageFile = path.join(__dirname, '/modals', packageString);
      if (fs.existsSync(packageFile)) {
         modalFiles.push({ dir: packageString, files: fs.readdirSync(packageFile).filter(isCommandFile) });
      }
   }
   for (const packageFile of modalFiles) {
      for (const file of packageFile.files) {
         const fileRequire = await import(`./modals/${packageFile.dir}/${file}`);
         if (auxdibot.modals) {
            auxdibot.modals.set(fileRequire.default.name, fileRequire.default);
         }
      }
   }
   console.log(`-> Refreshed ${auxdibot.modals.size} modals.`);
}
