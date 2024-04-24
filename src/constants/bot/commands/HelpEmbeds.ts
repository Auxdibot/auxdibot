import { EmbedBuilder, APIEmbed } from 'discord.js';
import { CustomEmojis } from '../CustomEmojis';
import { Auxdibot } from '@/interfaces/Auxdibot';
import Modules from './Modules';
export const HelpEmbeds: { [k: string]: (auxdibot: Auxdibot) => APIEmbed } = {
   general: (auxdibot) =>
      new EmbedBuilder()
         .setTitle(`${CustomEmojis.AUXDIBOT} General Help`)
         .setDescription(
            `Auxdibot's features are organized into individual \"Modules\" each containing different commands. Commands can also contain subcommands. \n\nModules can be viewed using the /help modules command. To view a module's commands and a general description of the module's functionality, use the \`/help module (module name)\` command. \n\nCommands can be viewed using the \`/help command (command name)\` command, displaying the command's permission and subcommands.\n\nPlaceholders can be used in the ${CustomEmojis.MESSAGES} \`Messages\` and ${CustomEmojis.GREETINGS} \`Greetings\` modules. By including \`%[insert placeholder name]%\` in any text field, it will fill in that placeholder with information. You can view a list of these placeholders using \`/help placeholders\`.\n\nFor commands that have a \`duration\`, \`interval\`, or \`timestamp\` option (like muting or banning in the ${CustomEmojis.MODERATION} \`Moderation\` module, or ${CustomEmojis.SCHEDULES} Scheduled Messages), you can specify a timestamp. (M for months, m for minutes, h for hours, d for days, etc.) If the duration option is left empty, it will be substituted for a permanent duration.\n**Timestamp Examples**\n\n* 1M for 1 month\n* 9h for 9 hours\n* 2d for 2 days\n* 3w for 3 weeks`,
         )
         .setColor(auxdibot.colors.default)
         .addFields({
            name: 'Commands',
            value: auxdibot.commands
               .filter((i) => i.info.module == Modules.General)
               .reduce((acc, i) => acc + ` **/${i.data.name}**\n> ${i.info.description}\n\n`, ''),
         })
         .toJSON(),
   settings: (auxdibot) =>
      new EmbedBuilder()
         .setTitle(`${CustomEmojis.BOLT} Settings Help`)
         .setColor(auxdibot.colors.default)
         .setDescription(
            "Auxdibot has a built in suite of easy-to-navigate settings, allowing administrators to customize every behavior of Auxdibot.\n\nAdministrators can view their server's configuration with `/settings view`, displaying every setting on your server.\n\nAuxdibot also features a built-in logging system, logging every action on your server to a text channel! You can setup the channel where logs are sent with `/logs channel [channel, leave empty to disable logs]`. You can additionally filter an action from showing up in your log channel using `/logs filter [log action]`. You can view a list of log actions with `/logs actions`. If you want to view the last 10 logs on your server, you can use `/logs latest`.\n\nIf you don't like one of Auxdibot's modules or one of Auxdibot's modules is conflicting with another bot, it can be disabled and enabled using the `/modules` command. Disabling a feature will disable all Auxdibot commands attached to that module and disable any recurring actions for that module on your server.",
         )
         .addFields({
            name: 'Commands',
            value: auxdibot.commands
               .filter((i) => i.info.module == Modules.Settings)
               .reduce((acc, i) => acc + ` **/${i.data.name}**\n> ${i.info.description}\n\n`, ''),
         })
         .toJSON(),
   moderation: (auxdibot) =>
      new EmbedBuilder()
         .setTitle(`${CustomEmojis.MODERATION} Moderation Help`)
         .setColor(auxdibot.colors.default)
         .setDescription(
            "Auxdibot has a wide suite of moderation commands & utilities, including AutoMod!\n\nAdministrators can setup AutoMod blacklisted phrases using the `/moderation blacklist (add|list|punishment|remove)` commands, setup the spam, invites, or attachments filter for their server with the `/moderation (spam|attachments|invites)` commands, or add AutoMod exceptions (not punished for saying blacklisted phrases or exceeding spam limits) with the `/moderation exceptions (add|list|remove)` commands.\n\nAuxdibot has four primary punishment types: Warns, Mutes, Kicks, and Bans. All come ready-to-use out of the box. When punishing a user, you must specify the duration as a timestamp (ex. `1m` for 1 minute, `1d` for 1 day, `1h` for 1 hour) Administrators can specify a mute role for mutes by using `/moderation settings mute_role`. If there is no mute role on your server, Auxdibot will use Discord's Timeout system. You can also choose what punishment information the user is sent in DMs with the `/moderation settings (send_moderator|send_reason)` commands.",
         )
         .addFields({
            name: 'Commands',
            value: auxdibot.commands
               .filter((i) => i.info.module == Modules.Moderation)
               .reduce((acc, i) => acc + ` **/${i.data.name}**\n> ${i.info.description}\n\n`, ''),
         })
         .toJSON(),
   messages: (auxdibot) =>
      new EmbedBuilder()
         .setTitle(`${CustomEmojis.MESSAGES} Messages Help`)
         .setColor(auxdibot.colors.default)
         .setDescription(
            `Auxdibot's ${CustomEmojis.MESSAGES} \`Messages\` module allows Administrators to create custom Embeds for their servers down to the tiniest detail, and create Scheduled Messages that will run on an interval!\n\nTo create an Embed using Auxdibot, use the \`/embed create\` command. You can input a title field, description field, color field, content field (message content sent with Embed) and more! For commands that use Auxdibot's embed creation parameters, there is a \`fields\` parameter. For every field, use \`|d|\` to seperate field titles from their descriptions, and \`|s|\` to seperate fields. Embeds created with slash commands do not support inline fields.\n\n**Fields Example**\n\n\`Field 1|d|Field description for Field 1...|s|Field 2|d|Field description for Field 2...\`\n\n*This creates 2 Embed Fields, one with the name Field 1, containing "Field description for Field 1...", and another with the name Field 2, containing "Field description for Field 2..."*\n\nAlternatively, Administrators can create Embed and Scheduled Messages on Auxdibot's [dashboard site](${process.env.BOT_HOMEPAGE}), featuring an easy-to-use Embed creator, allowing you to preview the Embed you are creating!\n\nYou can view a full list of Embed Parameters by running the command \`/embed parameters\`.\n\nScheduled messages can be created using Auxdibot, and will run on the \`start_date\` you specified (or now if the start_date is empty), and will run every \`interval\` (as a timestamp (ex. \`1m\` for 1 minute, \`1d\` for 1 day, \`1h\` for 1 hour))`,
         )
         .addFields({
            name: 'Commands',
            value: auxdibot.commands
               .filter((i) => i.info.module == Modules.Messages)
               .reduce((acc, i) => acc + ` **/${i.data.name}**\n> ${i.info.description}\n\n`, ''),
         })
         .toJSON(),
   greetings: (auxdibot) =>
      new EmbedBuilder()
         .setTitle(`${CustomEmojis.GREETINGS} Greetings Help`)
         .setColor(auxdibot.colors.default)
         .setDescription(
            `Administrators can setup greeting & departure messages with Auxdibot's ${CustomEmojis.GREETINGS} \`Greetings\` module!\n\nGreetings use the Auxdibot Embed Parameters (see ${CustomEmojis.MESSAGES} \`Messages\` module under \`/help all\` command) and Placeholders (\`/help placeholders\`) for creating Join, Join DM, and Leave messages for your server!\n\nThe Greetings module will send a Join message in the join/leave messages channel (set with \`/settings join_leave_channel\`) and DM the user with the Join DM message. When a user leaves the server, Auxdibot will post the Leave message in the join/leave channel.\n\nBy making a Join/Join DM/Leave message empty, it won't be sent. You can disable Greetings on your at any time by disabling the module \`Greetings\`.`,
         )
         .addFields({
            name: 'Commands',
            value: auxdibot.commands
               .filter((i) => i.info.module == Modules.Greetings)
               .reduce((acc, i) => acc + ` **/${i.data.name}**\n> ${i.info.description}\n\n`, ''),
         })
         .toJSON(),
   roles: (auxdibot) =>
      new EmbedBuilder()
         .setTitle(`${CustomEmojis.ROLES} Roles Help`)
         .setColor(auxdibot.colors.default)
         .setDescription(
            `Auxdibot allows Administrators to fully interact with the roles on their server using Auxdibot's ${CustomEmojis.ROLES} \`Roles\` module.\n\nAdministrators can create "Reaction Roles" (When a user reacts with X reaction to Auxdibot's message, they receive Y role) using the \`/reaction_roles add (channel) (roles) [title]\` or \`/reaction_roles add_custom (channel) (roles) [...auxdibot embed parameters]\` for a reaction role with custom content! When creating a reaction role, the \`roles\` parameter must use a format of \`([emoji] [role] [...emoji2] [...role2])\` (ex. ":smile: \`@(Role Here)\` :trophy: \`@(Some Other Role)\` :shield: \`@(Role 3 Here)\`" ).\n\nYou can set Join Roles (roles that are given to a user on joining) or Sticky Roles (roles that a user keeps when rejoining the server) using the \`/join_roles\` and \`/sticky_roles\` commands!\n\nAdditionally, Administrators can give/take a role away from every user with the \`/massrole\` command!`,
         )
         .addFields({
            name: 'Commands',
            value: auxdibot.commands
               .filter((i) => i.info.module == Modules.Roles)
               .reduce((acc, i) => acc + ` **/${i.data.name}**\n> ${i.info.description}\n\n`, ''),
         })
         .toJSON(),
   levels: (auxdibot) =>
      new EmbedBuilder()
         .setTitle(`${CustomEmojis.LEVELS} Levels Help`)
         .setColor(auxdibot.colors.default)
         .setDescription(
            `Auxdibot features a Levels system, which is immediately ready to be used on your server!\n\nAny user can check their level by running the command \`/levels stats\` or view the leaderboard for their server with \`/levels leaderboard\`.\n\nAdministrators can add rewards through the \`/levels (add_reward|remove_reward|rewards)\` command. Additionally, Message XP, levelup messages, and individual member XP can be tweaked using the \`/levels\` command.\n\nAdministrators can disable the \`Levels\` module at any time, which will disable leveling and levelup messages.`,
         )
         .addFields({
            name: 'Commands',
            value: auxdibot.commands
               .filter((i) => i.info.module == Modules.Levels)
               .reduce((acc, i) => acc + ` **/${i.data.name}**\n> ${i.info.description}\n\n`, ''),
         })
         .toJSON(),
   suggestions: (auxdibot) =>
      new EmbedBuilder()
         .setTitle(`${CustomEmojis.SUGGESTIONS} Suggestions Help`)
         .setColor(auxdibot.colors.default)
         .setDescription(
            `Auxdibot's suggestion system makes it easy for users to suggest ideas for your server!\n\nUsers can create suggestions with \`/suggestions create\`, and administrators can state the result of the suggestion with the \`/suggestions (add|deny|consider|accept) (suggestion id) [reason]\` commands. Once a suggestion is created, users can react to it with the suggestions reactions that are set using \`/suggestions (add_reaction|remove_reaction|reactions)\`. If discussion threads are enabled with \`/suggestions discussion_threads\`, a thread will be created for that suggestion, for users to discuss about the suggestion. (enabled by default). If you want suggestion updates filtered to a seperate channel, use the \`/suggestions updates_channel (channel)\` command.\n\nAdministrators can ban users from making suggestions by using the \`/suggestions (ban|unban)\` commands.`,
         )
         .addFields({
            name: 'Commands',
            value: auxdibot.commands
               .filter((i) => i.info.module == Modules.Suggestions)
               .reduce((acc, i) => acc + ` **/${i.data.name}**\n> ${i.info.description}\n\n`, ''),
         })
         .toJSON(),
   starboard: (auxdibot) =>
      new EmbedBuilder()
         .setTitle(`${CustomEmojis.STARBOARD} Starboard Help`)
         .setDescription(
            "Highlight the top posts of your server with Auxdibot's starboard! (which is sort of like a global pins system).\n\nAdministrators can set the starboard channel with `/starboard channel`, set the starboard reaction with `/starboard reaction`, and the reaction count with `/starboard reaction_count`. When a message reaches the reaction count of the reaction you specified, that message is posted to your server's starboard.",
         )
         .setColor(auxdibot.colors.default)
         .addFields({
            name: 'Commands',
            value: auxdibot.commands
               .filter((i) => i.info.module == Modules.Starboard)
               .reduce((acc, i) => acc + ` **/${i.data.name}**\n> ${i.info.description}\n\n`, ''),
         })
         .toJSON(),
};
