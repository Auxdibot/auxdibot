import { SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import Embeds from '@/config/embeds/Embeds';
import canExecute from '@/util/canExecute';
import { IPunishment } from '@/mongo/schema/PunishmentSchema';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import { LogType } from '@/config/Log';
import Modules from '@/config/Modules';

const kickCommand = <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('kick')
      .setDescription('Kick a user using Auxdibot.')
      .addUserOption((builder) => builder.setName('user').setDescription('User that will be kicked.').setRequired(true))
      .addStringOption((builder) =>
         builder.setName('reason').setDescription('Reason for kick (Optional)').setRequired(false),
      ),
   info: {
      module: Modules['Moderation'],
      description: 'Kicks a user, removing them from the server and adding a kick to their record on the server.',
      usageExample: '/kick (user) [reason]',
      permission: 'moderation.kick',
   },
   async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const user = interaction.options.getUser('user', true),
         reason = interaction.options.getString('reason') || 'No reason specified.';
      const counter = await interaction.data.guildData.fetchCounter();
      const member = interaction.data.guild.members.resolve(user.id);
      if (!member) {
         const errorEmbed = Embeds.ERROR_EMBED.toJSON();
         errorEmbed.description = 'This user is not on the server!';
         return await interaction.reply({ embeds: [errorEmbed] });
      }
      if (!canExecute(interaction.data.guild, interaction.data.member, member)) {
         const noPermissionEmbed = Embeds.DENIED_EMBED.toJSON();
         noPermissionEmbed.title = '⛔ No Permission!';
         noPermissionEmbed.description = `This user has a higher role than you or owns this server!`;
         return await interaction.reply({ embeds: [noPermissionEmbed] });
      }
      interaction.data.guild.members
         .kick(user, reason)
         .then(async () => {
            if (!interaction.data) return;
            const kickData = <IPunishment>{
               type: 'kick',
               reason,
               date_unix: Date.now(),
               dmed: false,
               expired: true,
               expires_date_unix: undefined,
               user_id: user.id,
               moderator_id: interaction.user.id,
               punishment_id: counter.incrementPunishmentID(),
            };
            interaction.data.guildData.punish(kickData).then(async (embed) => {
               if (!embed || !interaction.data) return;
               await interaction.data.guildData.log(
                  interaction.data.guild,
                  {
                     user_id: interaction.user.id,
                     description: 'A user was kicked.',
                     date_unix: Date.now(),
                     type: LogType.KICK,
                     punishment: kickData,
                  },
                  true,
               );
               return await interaction.reply({ embeds: [embed] });
            });
         })
         .catch(async () => {
            const errorEmbed = Embeds.ERROR_EMBED.toJSON();
            errorEmbed.description = "Couldn't kick that user.";
            return await interaction.reply({ embeds: [errorEmbed] });
         });
   },
};
module.exports = kickCommand;
