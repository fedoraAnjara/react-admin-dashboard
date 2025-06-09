import { useEffect, useState, useContext } from "react";
import {
  Box,
  Typography,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
} from "@mui/material";
import { tokens } from "../../theme";
import { AuthContext } from "../../AuthContext";
import StatBox from "../../components/StatBox";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";

const DashboardUser = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { auth } = useContext(AuthContext);

  const [dashboardData, setDashboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const rowsPerPage = 4;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!auth?.token) {
          setError("Pas de token d'authentification");
          setLoading(false);
          return;
        }

        const res = await fetch("http://localhost:5000/api/dashboard", {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(`Erreur ${res.status}: ${errorData.error || "Erreur inconnue"}`);
        }

        const data = await res.json();
        setDashboardData(data);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [auth?.token]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  if (loading) {
    return (
      <Box m="20px">
        <Typography>Chargement des données...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box m="20px">
        <Typography color="error">Erreur: {error}</Typography>
      </Box>
    );
  }

  const totalCalories = dashboardData.reduce((sum, d) => sum + d.calories_burned, 0);
  const totalWorkouts = dashboardData.reduce((sum, d) => sum + d.workouts_done, 0);

  // Données à afficher dans le tableau (page courante)
  const paginatedData = dashboardData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box m="20px">
      <Typography variant="h6" color={colors.grey[300]} mb="20px">
        Bienvenue {auth?.name || "Utilisateur"}
      </Typography>
        {dashboardData.subscriptionEnd ? (
        <Typography variant="body1" color={colors.grey[100]} mb="20px">
            Date de fin d'abonnement :{" "}
            <strong>
            {new Date(dashboardData.subscriptionEnd).toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "long",
                day: "numeric",
            })}
            </strong>
        </Typography>
        ) : (
        <Typography variant="body1" color={colors.grey[100]} mb="20px">
            Aucun abonnement actif
        </Typography>
        )}


      {/* Statistiques */}
      <Box display="flex" gap="20px" mb="30px" flexWrap="wrap">
        <Box
          flex="1"
          minWidth="250px"
          backgroundColor={colors.primary[400]}
          borderRadius="8px"
          p="20px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={totalWorkouts.toString()}
            subtitle="Séances effectuées"
            progress={Math.min(totalWorkouts / 50, 1)}
            increase="+3 cette semaine"
            icon={<FitnessCenterIcon sx={{ color: colors.greenAccent[600], fontSize: "28px" }} />}
          />
        </Box>

        <Box
          flex="1"
          minWidth="250px"
          backgroundColor={colors.primary[400]}
          borderRadius="8px"
          p="20px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={totalCalories.toString()}
            subtitle="Calories brûlées"
            progress={Math.min(totalCalories / 50000, 1)}
            increase="+7% cette semaine"
            icon={<LocalFireDepartmentIcon sx={{ color: colors.redAccent[600], fontSize: "28px" }} />}
          />
        </Box>
      </Box>

      {/* Détails des semaines en tableau */}
      <Box>
        <Typography variant="h6" fontWeight="600" color={colors.grey[100]} mb="10px">
          Détail par semaine
        </Typography>

        {dashboardData.length === 0 ? (
          <Typography color={colors.grey[300]}>Aucune donnée trouvée.</Typography>
        ) : (
          <Paper sx={{ width: "100%", overflow: "hidden", backgroundColor: colors.primary[500] }}>
            <TableContainer>
              <Table stickyHeader aria-label="tableau détails semaines">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: colors.greenAccent[400] }}>Semaine du</TableCell>
                    <TableCell>Calories brûlées</TableCell>
                    <TableCell>Séances effectuées</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.map((item, index) => (
                    <TableRow key={index} hover role="checkbox" tabIndex={-1}>
                      <TableCell sx={{ color: colors.greenAccent[400] }}>
                        {new Date(item.week_start).toLocaleDateString("fr-FR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell>{item.calories_burned}</TableCell>
                      <TableCell>{item.workouts_done}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[rowsPerPage]}
              component="div"
              count={dashboardData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              labelRowsPerPage="" // Pour ne pas afficher "Rows per page"
              sx={{
                backgroundColor: colors.primary[500],
                color: colors.grey[100],
                ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
                  color: colors.grey[100],
                },
                ".MuiTablePagination-actions button": {
                  color: colors.grey[100],
                },
              }}
            />
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default DashboardUser;
