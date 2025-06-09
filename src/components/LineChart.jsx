import { ResponsiveLine } from "@nivo/line";

const LineChart = ({ data = [], isDashboard = false }) => {
  // Si aucune donnée passée, on peut afficher un exemple ou un fallback
  const defaultData = [
    {
      id: "Exemple",
      color: "hsl(252, 70%, 50%)",
      data: [
        { x: "Semaine 1", y: 100 },
        { x: "Semaine 2", y: 200 },
        { x: "Semaine 3", y: 300 },
      ],
    },
  ];

  return (
    <ResponsiveLine
      data={data.length > 0 ? data : defaultData}
      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
      xScale={{ type: "point" }}
      yScale={{ type: "linear", min: "auto", max: "auto", stacked: false }}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        orient: "bottom",
        legend: isDashboard ? undefined : "Semaine",
        legendOffset: 36,
        legendPosition: "middle",
      }}
      axisLeft={{
        orient: "left",
        legend: isDashboard ? undefined : "Calories brûlées",
        legendOffset: -40,
        legendPosition: "middle",
      }}
      pointSize={10}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      legends={
        isDashboard
          ? []
          : [
              {
                anchor: "bottom-right",
                direction: "column",
                justify: false,
                translateX: 100,
                translateY: 0,
                itemsSpacing: 0,
                itemDirection: "left-to-right",
                itemWidth: 80,
                itemHeight: 20,
                symbolSize: 12,
                symbolShape: "circle",
              },
            ]
      }
    />
  );
};

export default LineChart;
