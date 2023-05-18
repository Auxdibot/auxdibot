import { SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@util/types/templates/AuxdibotCommand';
import Embeds from '@util/constants/Embeds';
import { toEmbedField } from '@schemas/PunishmentSchema';
import AuxdibotCommandInteraction from '@util/types/templates/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@util/types/AuxdibotCommandData';
import { LogType } from '@util/types/enums/Log';
import Modules from '@util/constants/Modules';

const unbanCommand = <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('unban')
      .setDescription('Unban a user.')
      .addUserOption((builder) =>
         builder
            .setName('user')
            .setDescription('The user to be unbanned. Use their Discord user ID.')
            .setRequired(true),
      ),
   info: {
      module: Modules['Moderation'],
      description: 'Unbans a user if they are currently banned. For banned members, use their user ID.',
      usageExample: '/unban (user)',
      permission: 'moderation.ban.remove',
   },
   async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const user = interaction.options.getUser('user', true);
      const data = await interaction.data.guildData.fetchData();
      const banned = data.getPunishment(user.id, 'ban');
      if (!banned) {
         const errorEmbed = Embeds.ERROR_EMBED.toJSON();
         errorEmbed.description = "This user isn't banned!";
         return await interaction.reply({ embeds: [errorEmbed] });
      }
      interaction.data.guild.bans.remove(user.id).catch(() => undefined);
      banned.expired = true;
      await interaction.data.guildData.save();

      const embed = Embeds.SUCCESS_EMBED.toJSON();
      embed.title = `📥 Unbanned ${user.tag}`;
      embed.description = `User was unbanned.`;
      embed.fields = [toEmbedField(banned)];
      await interaction.data.guildData.log(
         interaction.data.guild,
         {
            user_id: interaction.user.id,
            description: 'A user was unbanned.',
            date_unix: Date.now(),
            type: LogType.UNBAN,
            punishment: banned,
         },
         true,
      );
      await interaction.reply({ embeds: [embed] });
   },
};
module.exports = unbanCommand;
