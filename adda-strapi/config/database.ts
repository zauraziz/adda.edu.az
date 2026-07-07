import path from 'path';
import type { Core } from '@strapi/strapi';

/**
 * ADDA CMS — verilənlər bazası konfiqurasiyası.
 *  • Lokal (dev): DATABASE_CLIENT təyin olunmayıb → SQLite (.tmp/data.db), sıfır konfiqurasiya.
 *  • Render (prod): DATABASE_CLIENT=postgres + DATABASE_URL=<Neon> → Neon Postgres (SSL avtomatik).
 *
 * Neon üçün lazım olan yeganə env dəyişənləri:
 *   DATABASE_CLIENT=postgres
 *   DATABASE_URL=postgresql://user:pass@ep-xxx-pooler.<region>.aws.neon.tech/dbname?sslmode=require
 * (connectionString pg tərəfindən parse olunub aşağıdakı default host/user/... dəyərlərini əvəz edir)
 */
const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Database => {
  const client = env('DATABASE_CLIENT', 'sqlite');

  const connections = {
    postgres: {
      connection: {
        connectionString: env('DATABASE_URL'),
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME', 'strapi'),
        user: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi'),
        // Neon həmişə SSL tələb edir; connectionString olduqda avtomatik qoşulur.
        ssl: {
          rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', false),
        },
        schema: env('DATABASE_SCHEMA', 'public'),
      },
      pool: {
        min: env.int('DATABASE_POOL_MIN', 2),
        max: env.int('DATABASE_POOL_MAX', 10),
      },
    },
    sqlite: {
      connection: {
        filename: path.join(__dirname, '..', '..', env('DATABASE_FILENAME', '.tmp/data.db')),
      },
      useNullAsDefault: true,
    },
  };

  if (!(client in connections)) {
    throw new Error(`Unsupported DATABASE_CLIENT: ${client}. Use "postgres" or "sqlite".`);
  }

  type DatabaseClient = keyof typeof connections;

  return {
    connection: {
      client: client as DatabaseClient,
      ...connections[client as DatabaseClient],
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  } as Core.Config.Database;
};

export default config;