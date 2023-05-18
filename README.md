<div align="center" id="header">
   <a href="https://bot.auxdible.me">
      <img src="https://github.com/Auxdible/auxdibot/blob/main/app/public/icon.png?raw=true" alt="Auxdibot icon" width=250/>
   </a>
   <div id="badges">
      <div id="badges-row1">
         <a href="https://discord.gg/tnsFW9CQEn">
            <img src="https://img.shields.io/badge/Auxdibot%20Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white" width=150/>
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

Auxdibot is a multipurpose WIP Discord utility bot, created by Auxdible with the MERN tech stack using TypeScript.

### Table of Contents

`/lib` - **discord.js & express.js backend, using passport with passport-discord with Discord OAuth2 for authentication with the mongoose ODM for MongoDB.**

`/app` - **React with react-router and Bootstrap frontend using axios for api requests.**

## How to Use

Auxdibot uses Discord's slash command system. If you want to run any command you must prefix it with a `/` and ensure you are running one of Auxdibot's commands.

### Basic Commands

* `/help [command] [subcommand]` - View a list of every command or information about a specific command.

* `/placeholders` - View every placeholder.

* `/user (user)` - View information about a user and enforce punishments with an easy-to-use embed.

* `/record (user)` - View a user's previous punishments.

* `/settings` - View the settings or change settings with the various slash commands on this command.

* `/permissions` - View, delete or create permission overrides for certain permissions on Auxdibot.

* `/embed` - Create or edit Discord Embeds with **ZERO** coding knowledge! Custom JSON is also supported.

* `/punishment` - View a punishment, list the latest server punishments or delete a punishment off of someone's record.

* `/suggestions` - Change the settings for suggestions, or create a suggestion with `/suggestions create`

* `/levels` - Manage levels on your server, or check the leaderboard!

## How to Run

If you would like to run Auxdibot on your own machine:

* Go to the file where you would like the `auxdibot` file to be stored.
* Install Git and run `git clone https://github.com/Auxdible/auxdibot.git`
* Run `npm i --save` in the root `auxdibot` file
* Run `npm i --save` in the `/lib` file
* Run `npm i --save` in the `/app` file
* Run `npm run build` in the root `auxdibot` file
* The frontend build will be located at `/app/dist`
* The backend build will be located at `/lib/dist`
* Create a `.env` file in `/lib`
* Configure the `.env` file with all the parameters specified in `sample.env`
    * This step **WILL** require a MongoDB URI, Discord Bot Token, OAuth2 Client ID, and an OAuth2 Client Secret. Come up with an original or random assortment of characters for `EXPRESS_SESSION_SECRET`.
* For development, cd to the root `auxdibot` and run `npm run dev`
* For production, move the frontend build to a web server (ex. NGINX or Apache). Run the `/lib/dist/index.js` file to start the bot & express server.


## Completed/Testing Features

`🔨` *Punishments & Moderation*

`🗒️` *Logging*

`✋` *Permissions*

`💻` *Embed Creator*

`👋` *Welcome & Leave Messages*

`👈` *Role Management (Join Roles, Sticky Roles, Massrole, Reaction Roles)*

`🔺` *Suggestions*

`🏆` *Levels*

## Planned Features

`⭐` *Starboard*

`🧰` *Easy Setup Command*

`🧑‍💻` *Express REST API*

`🖥️` *Dashboard*

## Credits

This project is developed solely by [Auxdible](https://github.com/Auxdible) on GitHub. Contact me on Discord using Auxdible#3003 or by my email.

