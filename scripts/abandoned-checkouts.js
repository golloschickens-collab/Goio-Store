import fetch from 'node-fetch';
import dayjs from 'dayjs';
import { api, headers } from './_shopify.js';

const headersJSON = { ...headers, 'Content-Type': 'application/json' };
