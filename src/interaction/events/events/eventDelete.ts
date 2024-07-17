import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildScheduledEvent, GuildScheduledEventStatus, PartialGuildScheduledEvent } from 'discord.js';

export function eventDelete(
   auxdibot: Auxdibot,
   event: PartialGuildScheduledEvent | GuildScheduledEvent<GuildScheduledEventStatus>,
) {
   auxdibot.level_events = auxdibot.level_events.filter((i) => i[1] != event.id);
}
