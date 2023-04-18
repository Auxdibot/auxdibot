import dotenv from 'dotenv';
import { AuxdibotClient } from "./modules/discord";
import {AuxdibotAPI} from "./modules/express";
import {MongooseClient} from "./modules/mongoose";

dotenv.config();

export let mongoose = new MongooseClient().init().then(mongoose => mongoose);
export let client = new AuxdibotClient().init().then(client => client);
export let express = new AuxdibotAPI().init().then(express => express);

