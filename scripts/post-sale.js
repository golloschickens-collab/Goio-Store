import dotenv from 'dotenv';
import { existsSync } from 'fs';
import fetch from 'node-fetch';
import dayjs from 'dayjs';

const env = process.env.SHOPIFY_ENV || 'dev';
const candidates = [`.env.${env}`, '.env.local', '.env'];
const chosen = candidates.find(p => existsSync(p));
dotenv.config({ path: chosen });

const shop = process.env.SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_ACCESS_TOKEN;
