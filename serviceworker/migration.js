const exe_query = require("../serviceworker/dbservice").exe_query;
const bcrypt = require("bcryptjs");

const migrate = async () => {
  const a = `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = '${process.env.DB}' AND table_name = '${process.env.A}') AS a;`;
  const b = `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = '${process.env.DB}' AND table_name = '${process.env.B}') AS b;`;
  const c = `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = '${process.env.DB}' AND table_name = '${process.env.C}') AS c;`;
  const d = `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = '${process.env.DB}'AND table_name = '${process.env.D}') AS d;`;
  const e = `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = '${process.env.DB}' AND table_name = '${process.env.E}') AS e;`;
  const f = `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = '${process.env.DB}' AND table_name = '${process.env.F}') AS f;`;
  // -----------------------------------
  const [at] = await exe_query(a);
  const [bt] = await exe_query(b);
  const [ct] = await exe_query(c);
  const [dt] = await exe_query(d);
  const [et] = await exe_query(e);
  const [ft] = await exe_query(f);
  if (at.a === 0) {
    try {
      await exe_query(`CREATE TABLE IF NOT EXISTS ${process.env.A} (id int(11) NOT NULL, uname varchar(255) NOT NULL, upwd varchar(255) NOT NULL, uemail varchar(255) NOT NULL, createdat datetime NOT NULL DEFAULT current_timestamp())`);
      await exe_query(`ALTER TABLE ${process.env.A} ADD PRIMARY KEY (id)`);
      await exe_query(`ALTER TABLE ${process.env.A} MODIFY id int(11) NOT NULL AUTO_INCREMENT`);
    } catch (err) {
      console.error("❌ Migration failed:", err);
      throw err;
    }
  }
  if (bt.b === 0) {
    try {
      await exe_query(`CREATE TABLE IF NOT EXISTS ${process.env.B} (sid int(11) NOT NULL, uid int(11) NOT NULL, token text NOT NULL, createdat datetime NOT NULL DEFAULT current_timestamp(), expiresat datetime NOT NULL)`);
      await exe_query(`ALTER TABLE ${process.env.B} ADD PRIMARY KEY (sid), ADD UNIQUE KEY token (token) USING HASH, ADD KEY sessions_ibfk_1 (uid)`);
      await exe_query(`ALTER TABLE ${process.env.B} MODIFY sid int(11) NOT NULL AUTO_INCREMENT`);
      await exe_query(`ALTER TABLE ${process.env.B} ADD CONSTRAINT sessions_ibfk_1 FOREIGN KEY (uid) REFERENCES ${process.env.A} (id) ON DELETE CASCADE ON UPDATE CASCADE`);
    } catch (err) {
      console.error("❌ Migration failed:", err);
      throw err;
    }
  }
  if (ct.c === 0) {
    try {
      await exe_query(`CREATE TABLE IF NOT EXISTS ${process.env.C} (id int(11) NOT NULL, name varchar(255) NOT NULL, email varchar(255) NOT NULL, subject varchar(255) NOT NULL, mcontent text NOT NULL, is_read int(1) NOT NULL, createdat datetime NOT NULL DEFAULT current_timestamp())`);
      await exe_query(`ALTER TABLE ${process.env.C} ADD PRIMARY KEY (id)`);
      await exe_query(`ALTER TABLE ${process.env.C} MODIFY id int(11) NOT NULL AUTO_INCREMENT`);
    } catch (err) {
      console.error("❌ Migration failed:", err);
      throw err;
    }
  }
  if (dt.d === 0) {
    await exe_query(`CREATE TABLE IF NOT EXISTS ${process.env.D} (id int(11) NOT NULL, day varchar(255) NOT NULL, start varchar(255) NOT NULL, end varchar(255) NOT NULL, is_working int(1) NOT NULL)`);
    await exe_query(`ALTER TABLE ${process.env.D} ADD PRIMARY KEY (id)`);
    await exe_query(`ALTER TABLE ${process.env.D} MODIFY id int(11) NOT NULL AUTO_INCREMENT`);
    await exe_query(`INSERT INTO ${process.env.D} (day, start, end, is_working) VALUES
    ('Mon', '08:00', '17:00', 1),
    ('Tue', '08:00', '17:00', 1),
    ('Wed', '08:00', '17:00', 1),
    ('Thu', '08:00', '17:00', 1),
    ('Fri', '08:00', '17:00', 1),
    ('Sat', '09:00', '14:00', 1),
    ('Sun', '09:00', '14:00', 0)`);
  }
  if (et.e === 0) {
    await exe_query(`CREATE TABLE IF NOT EXISTS ${process.env.E} (id int(11) NOT NULL, originalname varchar(255) NOT NULL, filename varchar(255) NOT NULL, filetype varchar(255) NOT NULL, category varchar(255) NOT NULL, filepath text NOT NULL, is_displayed int(1) NOT NULL DEFAULT 1, uploadedat datetime NOT NULL DEFAULT current_timestamp())`);
    await exe_query(`ALTER TABLE ${process.env.E} ADD PRIMARY KEY (id)`);
    await exe_query(`ALTER TABLE ${process.env.E} MODIFY id int(11) NOT NULL AUTO_INCREMENT`);
    await exe_query(`ALTER TABLE ${process.env.E} ADD UNIQUE KEY filename (filename) USING HASH`);
  }
  if (ft.f === 0) {
    await exe_query(`CREATE TABLE IF NOT EXISTS ${process.env.F} (id int(11) NOT NULL, category varchar(255) UNIQUE NOT NULL)`);
    await exe_query(`ALTER TABLE ${process.env.F} ADD PRIMARY KEY (id)`);
    await exe_query(`ALTER TABLE ${process.env.F} MODIFY id int(11) NOT NULL AUTO_INCREMENT`);
  }
  const angelHash = bcrypt.hashSync("8uUxgdHzFGFfXxhxV41o", 12);
  const testHash = bcrypt.hashSync("test123", 12);
  const insertAdminQuery = `INSERT INTO ${process.env.A} (uname, upwd, uemail) VALUES (?, ?, ?)`;
  const existingAdmins = await exe_query(`SELECT * FROM ${process.env.A} where uname=? or uname=?`, ["RAsS05zAvndjH1d6fvNl", "test"]);
  try {
    if (existingAdmins.length === 0) {
      await exe_query(insertAdminQuery, ["RAsS05zAvndjH1d6fvNl", angelHash, "angel@example.com"]);
      await exe_query(insertAdminQuery, ["test", testHash, "test@example.com"]);
    }
  } catch (err) {
    console.error("❌ Migration failed:", err);
    throw err;
  }
};

module.exports = { migrate };
