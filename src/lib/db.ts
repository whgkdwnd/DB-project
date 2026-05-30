import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',
  max: 10,
  prepare: false, // PgBouncer(Transaction pooler) 호환
});

export default sql;
