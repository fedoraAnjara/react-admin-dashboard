import {
  Box,
  Typography,
  useTheme,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useState, useEffect } from "react";

const Invoices = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [invoices, setInvoices] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    userId: "",
    cost: "",
    date: "",
  });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [rowSelectionModel, setRowSelectionModel] = useState([]);



  // Fetch invoices avec user info
  const fetchInvoices = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/invoices");
      const data = await response.json();

  const formatted = data.map((inv) => ({
    ...inv,
    id: inv.id,
    cost: parseFloat(inv.cost).toFixed(2),
    date: new Date(inv.date).toLocaleDateString("fr-FR"),
  }));

      setInvoices(formatted);
    } catch (err) {
      console.error("Erreur de chargement des factures :", err);
    }
  };

  // Fetch users pour le select
  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Erreur de chargement des utilisateurs :", err);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.userId || !formData.cost) {
      alert("User et coût sont obligatoires");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: parseInt(formData.userId),
          cost: parseFloat(formData.cost),
          date: formData.date || new Date().toISOString().split("T")[0],
        }),
      });

      if (!res.ok) throw new Error("Erreur lors de l'ajout de la facture");

      alert("Facture ajoutée avec succès !");
      setFormData({ userId: "", cost: "", date: "" });
      setShowForm(false); // <-- cacher le formulaire après succès
      fetchInvoices(); // rafraîchir la liste
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: "id", headerName: "ID" },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "phone",
      headerName: "Phone Number",
      flex: 1,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "cost",
      headerName: "Cost",
      flex: 1,
      renderCell: (params) => (
        <Typography color={colors.greenAccent[500]}>
          ${params.row.cost}
        </Typography>
      ),
    },
    {
      field: "date",
      headerName: "Date",
      flex: 1,
    },
  ];

  const handleDeleteSelection = async () => {
    if (rowSelectionModel.length === 0) {
      alert("Aucune facture sélectionnée.");
      return;
    }

    if (!window.confirm("Confirmer la suppression des factures sélectionnées ?")) return;

    try {
      await Promise.all(
        rowSelectionModel.map((id) =>
          fetch(`http://localhost:5000/api/invoices/${id}`, { method: "DELETE" })
        )
      );

      setInvoices((prev) => prev.filter((inv) => !rowSelectionModel.includes(inv.id)));
      setRowSelectionModel([]); // Réinitialise la sélection
    } catch (error) {
      alert("Erreur lors de la suppression");
      console.error(error);
    }
  };



  return (
    <Box m="20px">
      <Header title="INVOICES" subtitle="List of Invoice Balances" />

      {/* Bouton pour afficher / cacher le formulaire */}
      <Button
        variant="contained"
        color="primary"
        onClick={() => setShowForm(!showForm)}
        sx={{ mb: 2 }}
      >
        {showForm ? "Annuler" : "Ajouter une facture"}
      </Button>

      <Button
        variant="contained"
        color="error"
        onClick={handleDeleteSelection}
        sx={{ mb: 2, ml: 2 }}
      >
        Supprimer la sélection
      </Button>

      {/* Formulaire affiché uniquement si showForm est vrai */}
      {showForm && (
        <Box
          component="form"
          onSubmit={handleSubmit}
          mb="20px"
          display="flex"
          gap="20px"
          flexWrap="wrap"
          alignItems="center"
        >
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="user-select-label">Utilisateur</InputLabel>
            <Select
              labelId="user-select-label"
              label="Utilisateur"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              required
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.first_name} {user.last_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Coût"
            name="cost"
            type="number"
            inputProps={{ step: "0.01", min: "0" }}
            value={formData.cost}
            onChange={handleChange}
            required
            sx={{ width: 150 }}
          />

          <TextField
            label="Date"
            name="date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={formData.date}
            onChange={handleChange}
            sx={{ width: 180 }}
          />

          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? "Ajout en cours..." : "Ajouter Facture"}
          </Button>
        </Box>
      )}

      {/* Tableau des factures */}
      <Box
        height="65vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
        <DataGrid
          checkboxSelection
          rows={invoices}
          columns={columns}
          pageSize={5} // ✅ Affiche 5 lignes par page
          rowsPerPageOptions={[5]} // ✅ Fixe uniquement l'option 5
          pagination // ✅ Active la pagination côté client
          selectionModel={rowSelectionModel}
          onSelectionModelChange={(newSelection) => {
            setRowSelectionModel(newSelection);
          }}
        />
      </Box>
    </Box>
  );
};

export default Invoices;
