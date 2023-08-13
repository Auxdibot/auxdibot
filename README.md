<div align="center" id="header">
   <a href="https://bot.auxdible.me">
      <img src="https://bot.auxdible.me/icon.png" alt="Auxdibot icon" width=250/>
   </a>
   
   <div id="badges">
      <div id="badges-row1">
         <a href="https://discord.gg/tnsFW9CQEn">
            <img src="https://img.shields.io/badge/Auxdibot%20Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white" width=150/>
         </a>
         <a href="https://discord.com/oauth2/authorize?client_id=776496457867591711&scope=bot&permissions=329035279606">
            <img src="https://img.shields.io/badge/Invite%20Auxdibot-7289DA?style=for-the-badge&logo=discord&logoColor=white" width=150/>
         </a>
         <a href="https://trello.com/b/5lSIUz50/auxdibot">
            <img src="https://img.shields.io/badge/Auxdibot%20Trello-007AC0?style=for-the-badge&logo=trello&logoColor=white" alt="Auxdibot trello" width=150/>
         </a>
      </div>
      <div id="badges-row2">
         <img src="https://img.shields.io/github/commit-activity/w/Auxdible/auxdibot?style=flat-square"/>
         <img src="https://img.shields.io/github/contributors/Auxdible/auxdibot?style=flat-square"/>
         <img src="https://img.shields.io/github/last-commit/Auxdible/auxdibot?style=flat-square"/>
      </div>
      <div id="badges-row3">
         <img src="https://img.shields.io/github/stars/Auxdible/auxdibot?style=flat-square"/>
         <img src="https://img.shields.io/github/forks/Auxdible/auxdibot?style=flat-square"/>
      </div>
    </div>
   <h1>Auxdibot 🤖</h1>
</div>


## About Project

Auxdibot is a multipurpose Discord utility bot, utilizing the Prisma ORM and discord.js with TypeScript.

### Important Files

`/prisma` - **Contains the schema prisma file for the Prisma ORM.**

`/src` - **Contains the source code for Auxdibot including bot interactions, types, and util functions.**

`sample.env` - **Sample .env file, containing all .env parameters that need to be specified for Auxdibot to function properly**


## How to Use

Auxdibot uses Discord's slash command system. If you want to run any command you must prefix it with a `/` and ensure you are running one of Auxdibot's commands.

### Basic Commands

* `/help modules` - *View every module Auxdibot has, each containing various commands.*

* `/help module (module)` - *View all the commands for a specific module on Auxdibot.*

* `/help command (command) [subcommand]` - *View the usage and description of any Auxdibot command.*
  
* `/help placeholders` - *View every placeholder.*

* `/user (user)` - *View information about a user and enforce punishments with an easy-to-use button row.*

* `/punishment` - *View a punishment, list the latest server punishments, and view/edit a user's punishment record.*

* `/settings` - *View the settings for your server, or change certain settings for your server.*

* `/permissions` - *View, delete or create permission overrides for certain permissions on Auxdibot.*

* `/embed` - *Create or edit Discord Embeds with **ZERO** coding knowledge! Custom JSON is also supported.*

* `/suggestions` - *Change the settings for suggestions, or create a suggestion with `/suggestions create`*

* `/levels` - *Manage levels on your server, or check the leaderboard! You can view another member or your own level stats with `/levels stats`!*

* `/starboard` - *Change the settings for the starboard on your own server.*

## How to Run

If you would like to run Auxdibot on your own machine:

* Go to the file where you would like the `auxdibot` file to be stored.
* Install Git and run `git clone https://github.com/Auxdible/auxdibot.git`
* Run `npm i --save` in the root `auxdibot` file
* Run `npx prisma generate` in the root `auxdibot` file
* Run `npm run build` in the root `auxdibot` file
* The build will be located at `/dist`
* Create a `.env` file in the root `auxdibot` file (or use ecosystem.config.js if you are using `pm2`)
* Configure the `.env` file with all the parameters specified in `sample.env`
    * This step **WILL** require a MongoDB URI, Discord Bot Token, and Discord Bot Client ID. Status is optional, default "undefined"
* Run `npm start` to start Auxdibot!


## Features

`🔨` *Punishments & Moderation*

`🗒️` *Logging*

`✋` *Permissions*

`💻` *Embed Creator*

`👋` *Join, Join DM & Leave Messages*

`👈` *Role Management (Join Roles, Sticky Roles, Massrole, Reaction Roles)*

`🔺` *Suggestions*

`🏆` *Levels*

`⭐` *Starboard*

`⏲️` *Schedules*

## Credits

This project is developed solely by [Auxdible](https://github.com/Auxdible) on GitHub. Contact me on through my Discord, `auxdible`, or by my email. Contributions accepted.

