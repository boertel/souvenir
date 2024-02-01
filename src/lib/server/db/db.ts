import sqlite from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

import { schema } from './schema';

const sqliteDB = sqlite('./db.sqlite');
export const db = drizzle(sqliteDB, { schema });
