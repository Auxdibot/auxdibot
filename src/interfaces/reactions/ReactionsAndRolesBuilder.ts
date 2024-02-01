import { APIRole, Role } from 'discord.js';

export interface ReactionsAndRolesBuilder {
   role: Role | APIRole;
   emoji: string;
}
