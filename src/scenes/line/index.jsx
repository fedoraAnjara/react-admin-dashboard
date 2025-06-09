import { Box } from "@mui/material";
import Header from "../../components/Header";
import LineChart from "../../components/LineChart";
import { useEffect, useState } from "react";
import axios from "axios";

const Line = () => {
  const [userData, setUserData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/dashboard"); // Ton endpoint backend
        const data = res.data;

        // Transformer les données au bon format pour nivo
        const formatted = [
          {
            id: "Calories brûlées",
            data: data.map((item) => ({
              x: item.week_start, // ou une date formatée
              y: item.calories_burned,
            })),
          },
        ];

        setUserData(formatted);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Box m="20px">
      <Header title="Évolution des calories brûlées" subtitle="Par semaine" />
      <Box height="75vh">
        <LineChart data={userData} />
      </Box>
    </Box>
  );
};

export default Line;
