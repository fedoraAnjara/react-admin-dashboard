import express from "express";
import cors from "cors";
import pkg from "pg";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

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

// Middleware d'authentification
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: "Token manquant" });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token invalide" });
    }
    req.user = user;
    next();
  });
};

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: "Utilisateur non trouvé" });
    }

    // Comparer le mot de passe
    if (user.password !== password) {
      return res.status(401).json({ error: "Mot de passe incorrect" });
    }

    // Créer un VRAI token JWT avec l'ID utilisateur
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.ACCESS_TOKEN_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Réponse avec le vrai token et l'ID
    res.json({
      id: user.id,
      name: user.first_name + " " + user.last_name,
      email: user.email,
      role: user.role,
      token: token,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Route dashboard sécurisée par utilisateur
app.get('/api/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // ID récupéré du token JWT

    const data = await pool.query(`
      SELECT calories_burned, workouts_done, week_start
      FROM user_dashboard_data
      WHERE user_id = $1
      ORDER BY week_start ASC
    `, [userId]);

    res.json(data.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la récupération des données dashboard" });
  }
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

// GET sessions from PostgreSQL
app.get('/api/user_dashboard_data', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        udd.id, 
        udd.user_id, 
        u.first_name, 
        u.last_name, 
        udd.week_start, 
        udd.workouts_done, 
        udd.calories_burned,
        a.end_date
      FROM user_dashboard_data udd
      JOIN users u ON udd.user_id = u.id
      LEFT JOIN (
        SELECT DISTINCT ON (user_id) user_id, end_date
        FROM abonnement
        ORDER BY user_id, end_date DESC
      ) a ON a.user_id = u.id
      ORDER BY udd.week_start DESC
    `);

    const data = result.rows.map(row => ({
      id: row.id,
      user_id: row.user_id,
      name: `${row.first_name} ${row.last_name}`,
      week_start: row.week_start,
      workouts_done: row.workouts_done,
      calories_burned: row.calories_burned,
      end_date: row.end_date, // ✅ ajouté ici
    }));

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la récupération des sessions" });
  }
});

// POST new session into PostgreSQL
app.post('/api/user_dashboard_data', async (req, res) => {
  const { user_id, week_start, workouts_done, calories_burned } = req.body;
  try {
    // Vérifier que user existe
    const userCheck = await pool.query("SELECT id FROM users WHERE id = $1", [user_id]);
    if (userCheck.rowCount === 0) {
      return res.status(400).json({ error: "Utilisateur non trouvé" });
    }

    const result = await pool.query(
      `INSERT INTO user_dashboard_data (user_id, week_start, workouts_done, calories_burned)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [user_id, week_start, workouts_done, calories_burned]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de l'ajout de la session" });
  }
});

// PUT update session in PostgreSQL
app.put('/api/user_dashboard_data/:id', async (req, res) => {
  const { id } = req.params;
  const { week_start, workouts_done, calories_burned } = req.body;
  try {
    const result = await pool.query(
      `UPDATE user_dashboard_data
       SET week_start = $1, workouts_done = $2, calories_burned = $3
       WHERE id = $4
       RETURNING *`,
      [week_start, workouts_done, calories_burned, id]
    );

    if (result.rowCount === 0) return res.status(404).json({ error: "Session non trouvée" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la mise à jour" });
  }
});

// Créer un abonnement pour un utilisateur (admin ou user lui-même)
app.post('/api/abonnement', authenticateToken, async (req, res) => {
  const { startDate, endDate } = req.body;
  const userId = req.user.id;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: "startDate et endDate sont requis" });
  }

  try {
    // Insert un nouvel abonnement lié à l'utilisateur connecté
    const result = await pool.query(
      `INSERT INTO abonnement (user_id, start_date, end_date)
       VALUES ($1, $2, $3) RETURNING *`,
      [userId, startDate, endDate]
    );

    res.status(201).json({ message: "Abonnement créé", abonnement: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la création de l'abonnement" });
  }
});

// Récupérer les jours restants d'abonnement pour l'utilisateur connecté
app.get('/api/abonnement/jours-restants', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT end_date FROM abonnement WHERE user_id = $1 ORDER BY end_date DESC LIMIT 1`,
      [userId]
    );

    if (result.rowCount === 0) {
      return res.json({ joursRestants: 0, message: "Pas d'abonnement trouvé" });
    }

    const endDate = result.rows[0].end_date;
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const joursRestants = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 0);

    res.json({ joursRestants });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la récupération des jours restants" });
  }
});


app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});

