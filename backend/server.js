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
  const { firstName, lastName, email, contact, address1, address2, role } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, contact, address1, address2, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [firstName, lastName, email, contact, address1, address2, role]
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


app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: "Utilisateur non trouvé" });
    }

    // ✅ Comparer le mot de passe envoyé avec celui stocké en base
    if (user.password !== password) {
      return res.status(401).json({ error: "Mot de passe incorrect" });
    }

    // Si ok, envoyer les infos nécessaires
    res.json({
      id: user.id,
      name: user.first_name +"  "+ user.last_name,
      email: user.email,
      role: user.role,
      token: "fake-jwt-token", // ou ton vrai token plus tard
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


app.delete("/api/invoices/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query("DELETE FROM invoices WHERE id = $1", [id]);
    res.status(200).json({ message: "Facture supprimée" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Pour supprimer un contact
app.delete("/api/contacts/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query("DELETE FROM contacts WHERE id = $1", [id]);
    res.status(200).json({ message: "Contact supprimé" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.use("/uploads", express.static("uploads"));
