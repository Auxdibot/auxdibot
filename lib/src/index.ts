import 'module-alias/register';
import { AuxdibotClient } from './modules/discord';
import { AuxdibotAPI } from './modules/express';
import { MongooseClient } from './modules/mongoose';

export const mongoose = new MongooseClient().init().then((mongoose) => mongoose);

export const client = new AuxdibotClient().init().then((client) => client);
export const express = new AuxdibotAPI().init().then((express) => express);
