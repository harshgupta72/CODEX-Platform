import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

function getConfig() {
  const host = process.env.MYSQL_HOST;
  const user = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD;
  const database = process.env.MYSQL_DB;
  const port = process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306;
  if (!host || !user || !database) {
    throw new Error("Missing MySQL environment variables");
  }
  return { host, user, password, database, port };
}

export function getPool(): mysql.Pool {
  if (!pool) {
    const cfg = getConfig();
    pool = mysql.createPool({
      host: cfg.host,
      user: cfg.user,
      password: cfg.password,
      database: cfg.database,
      port: cfg.port,
      connectionLimit: 10,
      connectTimeout: 5000, // 5 seconds timeout
      waitForConnections: true,
      queueLimit: 0
    });
  }
  return pool!;
}

export async function ensureTables() {
  const p = getPool();
  await p.query(
    "CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, firebase_uid VARCHAR(128) UNIQUE, email VARCHAR(255), display_name VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
  );
  await p.query(
    "CREATE TABLE IF NOT EXISTS courses (id INT AUTO_INCREMENT PRIMARY KEY, owner_uid VARCHAR(128), title VARCHAR(255), description TEXT, category VARCHAR(128), difficulty VARCHAR(32), status VARCHAR(32), start_date VARCHAR(32), end_date VARCHAR(32), cover_image_url TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)"
  );
  
  await p.query(
    "CREATE TABLE IF NOT EXISTS assignments (id INT AUTO_INCREMENT PRIMARY KEY, owner_uid VARCHAR(128), title VARCHAR(255), description TEXT, due_date VARCHAR(32), total_points INT, status VARCHAR(32), course_id INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)"
  );
  await p.query(
    "CREATE TABLE IF NOT EXISTS problems (id INT AUTO_INCREMENT PRIMARY KEY, owner_uid VARCHAR(128), name VARCHAR(255), description TEXT, sample_input TEXT, sample_output TEXT, difficulty VARCHAR(32), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)"
  );
  await p.query(
    "CREATE TABLE IF NOT EXISTS notices (id INT AUTO_INCREMENT PRIMARY KEY, owner_uid VARCHAR(128), title VARCHAR(255), body TEXT, audience VARCHAR(32), course_id INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
  );

  await p.query(
    "CREATE TABLE IF NOT EXISTS chapters (id INT AUTO_INCREMENT PRIMARY KEY, course_id INT, title VARCHAR(255), description TEXT, status VARCHAR(32), order_index INT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE)"
  );

  await p.query(
    "CREATE TABLE IF NOT EXISTS topics (id INT AUTO_INCREMENT PRIMARY KEY, chapter_id INT, title VARCHAR(255), description TEXT, status VARCHAR(32), order_index INT DEFAULT 0, duration INT, image_data_url LONGTEXT, code_snippet LONGTEXT, video_url TEXT, video_data_url LONGTEXT, external_link TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE)"
  );
}
