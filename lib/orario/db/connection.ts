import { createConnection } from "mariadb";

export const conn = await createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.DB_NAME,
  logger: {
    network: (msg) => console.log(msg),
    query: (msg) => console.log(msg),
    error: (err) => console.error(err),
  },
});
