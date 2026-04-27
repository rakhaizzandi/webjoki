import { neon } from '@neondatabase/serverless';

type SqlClient = ReturnType<typeof neon>;
type QueryResult = Promise<Record<string, any>[]>;

let sqlClient: SqlClient | null = null;

function getConnectionString() {
  return (
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING
  );
}

function getSqlClient() {
  const connectionString = getConnectionString();

  if (!connectionString) {
    throw new Error(
      'Database connection string is missing. Set POSTGRES_URL or DATABASE_URL in Vercel Environment Variables.'
    );
  }

  if (!sqlClient) {
    sqlClient = neon(connectionString);
  }

  return sqlClient;
}

export const sql = ((strings: TemplateStringsArray, ...values: any[]): QueryResult => {
  return getSqlClient()(strings, ...values) as QueryResult;
}) as unknown as (strings: TemplateStringsArray, ...values: any[]) => QueryResult;
