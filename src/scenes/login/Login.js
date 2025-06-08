import { useState, useContext } from "react";
import { AuthContext } from "../../AuthContext"; // à créer (voir plus bas)
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Appelle ton backend login ici
    const res = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      login(data); // stocke token + role
      if (data.role === "admin") navigate("/");
      else if (data.role === "user") navigate("/user");
    } else {
      alert(data.error || "Erreur de connexion");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
      <h2>Connexion</h2>
        <input
        type="email"
        placeholder="Adresse email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        style={{ width: "100%", padding: 8, marginBottom: 12 }}
        />
      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        style={{ width: "100%", padding: 8, marginBottom: 12 }}
      />
      <button type="submit" style={{ width: "100%", padding: 10 }}>Se connecter</button>
    </form>
  );
};

export default Login;
