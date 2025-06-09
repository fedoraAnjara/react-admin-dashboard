import { useState, useEffect, useContext } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { AuthContext } from "../../AuthContext";
import Header from "../../components/Header";

const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { auth } = useContext(AuthContext);

  const [rows, setRows] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!auth?.token) return;

      try {
        const res = await fetch("http://localhost:5000/api/user_dashboard_data", {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        if (!res.ok) throw new Error("Erreur chargement des données");
        const data = await res.json();
        console.log("Données reçues :", data);
        setRows(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [auth?.token]);

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "name", headerName: "Nom", flex: 1, editable: false },
    {
      field: "workouts_done",
      headerName: "Séances effectuées",
      type: "number",
      width: 150,
      editable: true,
    },
    {
      field: "workouts_goal",
      headerName: "Objectif séances",
      type: "number",
      width: 150,
      editable: true,
    },
    {
      field: "calories_burned",
      headerName: "Calories brûlées",
      type: "number",
      width: 150,
      editable: true,
    },
    {
      field: "calories_goal",
      headerName: "Objectif calories",
      type: "number",
      width: 150,
      editable: true,
    },
  ];

  const handleRowEditCommit = async (params) => {
    const { id, field, value } = params;
    const updatedRow = rows.find((row) => row.id === id);
    if (!updatedRow) return;
    const newRow = { ...updatedRow, [field]: value };

    setRows((prev) => prev.map((row) => (row.id === id ? newRow : row)));

    try {
      const res = await fetch(`http://localhost:5000/api/user_dashboard_data/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(newRow),
      });
      if (!res.ok) throw new Error("Erreur mise à jour");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box m="20px">
      <Header title="Suivi des séances" subtitle="Gestion des objectifs utilisateurs" />
      <Box
        m="40px 0 0 0"
        height="75vh"
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
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={4}
          rowsPerPageOptions={[4]}
          checkboxSelection
          disableSelectionOnClick
          onCellEditCommit={handleRowEditCommit}
          getRowId={(row) => row.id} // change ici si nécessaire
        />
      </Box>
    </Box>
  );
};

export default Team;
