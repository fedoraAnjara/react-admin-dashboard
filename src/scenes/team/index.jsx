import { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  useTheme,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Snackbar,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import { tokens } from "../../theme";
import { AuthContext } from "../../AuthContext";
import Header from "../../components/Header";

const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { auth } = useContext(AuthContext);

  const [rows, setRows] = useState([]);
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });

  const [formData, setFormData] = useState({
    user_id: "",
    workouts_done: 0,
    calories_burned: 0,
    calories_goal: 0,
    week_start: "",
  });

  // Fetch data & users on token change
  useEffect(() => {
    if (!auth?.token) return;

    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/user_dashboard_data", {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        if (!res.ok) throw new Error("Erreur chargement des données");
        const data = await res.json();
        setRows(data);
      } catch (error) {
        showNotification(error.message || "Erreur lors du chargement des données", "error");
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users", {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        if (!res.ok) throw new Error("Erreur chargement des utilisateurs");
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        showNotification(error.message || "Erreur lors du chargement des utilisateurs", "error");
      }
    };

    fetchData();
    fetchUsers();
  }, [auth?.token]);

  const showNotification = (message, severity = "success") => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    {
      field: "name",
      headerName: "Nom",
      flex: 1,
      editable: false,
      renderCell: (params) => (
        <Typography sx={{ color: colors.greenAccent[400] }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "week_start",
      headerName: "Semaine du",
      width: 150,
      editable: false,
      valueFormatter: (params) => {
        if (!params.value) return "";
        return new Date(params.value).toLocaleDateString("fr-FR", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      },
    },
    {
      field: "workouts_done",
      headerName: "Séances effectuées",
      type: "number",
      width: 150,
      editable: true,
    },
    {
      field: "end_date",
  headerName: "Fin d’abonnement",
  width: 170,
  editable: false,
  valueFormatter: (params) => {
    if (!params.value) return "-";
    return new Date(params.value).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  },
  renderCell: (params) => (
    <Typography sx={{ color: colors.greenAccent[400] }}>
      {params.formattedValue}
    </Typography>
  ),
    },
    {
      field: "calories_burned",
      headerName: "Calories brûlées",
      type: "number",
      width: 150,
      editable: true,
    },
  ];

  const handleRowEditCommit = async (params) => {
    const { id, field, value } = params;
    const oldRow = rows.find((row) => row.id === id);
    if (!oldRow) return;

    const updatedRow = { ...oldRow, [field]: value };
    setRows((prev) => prev.map((row) => (row.id === id ? updatedRow : row)));

    try {
      const res = await fetch(`http://localhost:5000/api/user_dashboard_data/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(updatedRow),
      });
      if (!res.ok) throw new Error("Erreur mise à jour");
      showNotification("Données mises à jour avec succès");
    } catch (error) {
      showNotification(error.message || "Erreur lors de la mise à jour", "error");
      // Revert state on error
      setRows((prev) => prev.map((row) => (row.id === id ? oldRow : row)));
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);

    // Set default startOfWeek (Monday)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday ...
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Sunday
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() + diffToMonday);

    setFormData({
      user_id: "",
      workouts_done: 0,
      calories_burned: 0,
      calories_goal: 0,
      week_start: startOfWeek.toISOString().split("T")[0],
    });
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const handleFormChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.user_id) {
      showNotification("Veuillez sélectionner un utilisateur", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/user_dashboard_data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur lors de l'ajout");
      }
      showNotification("Nouvel enregistrement ajouté avec succès");
      handleCloseDialog();
      // Refresh data
      const newDataRes = await fetch("http://localhost:5000/api/user_dashboard_data", {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (newDataRes.ok) {
        const newData = await newDataRes.json();
        setRows(newData);
      }
    } catch (error) {
      showNotification(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      m="20px">
      <Header title="Suivi des séances"/>

      {/* Bouton d'ajout */}
      <Box mb="20px">
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          sx={{
            backgroundColor: colors.blueAccent[700],
            color: colors.grey[100],
            "&:hover": {
              backgroundColor: colors.blueAccent[800],
            },
          }}
        >
          Ajouter un enregistrement
        </Button>
      </Box>

      {/* DataGrid */}
      <Box
        height="65vh"
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: "none" },
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
          "& .MuiDataGrid-checkboxInput": {
            color: colors.greenAccent[200],
          },
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[6]}
          pageSize={6}
          checkboxSelection
          disableSelectionOnClick
          onCellEditCommit={handleRowEditCommit}
          getRowId={(row) => row.id}
        />
      </Box>

      {/* Dialog d'ajout */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: colors.primary[400] }}>
          <Typography variant="h6" color={colors.grey[100]}>
            Ajouter un nouvel enregistrement
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ backgroundColor: colors.primary[400], pt: 2 }}>
          <TextField
            select
            fullWidth
            label="Utilisateur"
            value={formData.user_id}
            onChange={handleFormChange("user_id")}
            margin="normal"
            sx={{
              "& .MuiInputLabel-root": { color: colors.grey[100] },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: colors.grey[300] },
                "&:hover fieldset": { borderColor: colors.grey[100] },
                "&.Mui-focused fieldset": { borderColor: colors.blueAccent[500] },
              },
              "& .MuiInputBase-input": { color: colors.grey[100] },
            }}
          >
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.first_name} {user.last_name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Séances effectuées"
            type="number"
            fullWidth
            margin="normal"
            value={formData.workouts_done}
            onChange={handleFormChange("workouts_done")}
            inputProps={{ min: 0 }}
            sx={{
              "& .MuiInputLabel-root": { color: colors.grey[100] },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: colors.grey[300] },
                "&:hover fieldset": { borderColor: colors.grey[100] },
                "&.Mui-focused fieldset": { borderColor: colors.blueAccent[500] },
              },
              "& .MuiInputBase-input": { color: colors.grey[100] },
            }}
          />

          <TextField
            label="Calories brûlées"
            type="number"
            fullWidth
            margin="normal"
            value={formData.calories_burned}
            onChange={handleFormChange("calories_burned")}
            inputProps={{ min: 0 }}
            sx={{
              "& .MuiInputLabel-root": { color: colors.grey[100] },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: colors.grey[300] },
                "&:hover fieldset": { borderColor: colors.grey[100] },
                "&.Mui-focused fieldset": { borderColor: colors.blueAccent[500] },
              },
              "& .MuiInputBase-input": { color: colors.grey[100] },
            }}
          />

          <TextField
            label="Semaine du"
            type="date"
            fullWidth
            margin="normal"
            value={formData.week_start}
            onChange={handleFormChange("week_start")}
            InputLabelProps={{ shrink: true }}
            sx={{
              "& .MuiInputLabel-root": { color: colors.grey[100] },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: colors.grey[300] },
                "&:hover fieldset": { borderColor: colors.grey[100] },
                "&.Mui-focused fieldset": { borderColor: colors.blueAccent[500] },
              },
              "& .MuiInputBase-input": { color: colors.grey[100] },
            }}
          />
        </DialogContent>

        <DialogActions sx={{ backgroundColor: colors.primary[400], p: 2 }}>
          <Button onClick={handleCloseDialog} color="secondary">
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            sx={{ backgroundColor: colors.greenAccent[600] }}
          >
            {loading ? "En cours..." : "Ajouter"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Team;
