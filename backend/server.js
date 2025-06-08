import express from "express";
import cors from "cors";
import pkg from "pg";

const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// Connexion à PostgreSQL
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "userdb",
  password: "240503",
  port: 5432,
});

// Route POST pour créer un utilisateur
app.post("/api/users", async (req, res) => {
  const { firstName, lastName, email, contact, address1, address2 } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, contact, address1, address2)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [firstName, lastName, email, contact, address1, address2]
    );

    res.status(201).json({ message: "User created", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});


app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.get("/api/invoices", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        invoices.id,
        invoices.cost,
        invoices.date,
        users.first_name || ' ' || users.last_name AS name,
        users.email,
        users.contact AS phone
      FROM invoices
      JOIN users ON invoices.user_id = users.id
      ORDER BY invoices.date DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});


app.post("/api/invoices", async (req, res) => {
  const { userId, cost, date } = req.body;
  try {
    await pool.query(
      "INSERT INTO invoices (user_id, cost, date) VALUES ($1, $2, $3)",
      [userId, cost, date]
    );
    res.status(201).json({ message: "Facture ajoutée avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de l'ajout de la facture" });
  }
});

