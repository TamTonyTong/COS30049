import { Line } from "react-chartjs-2";
import { useState, useEffect } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


const TradingChart = ({ tradingPair }) => {
  const [prices, setPrices] = useState([]);
  const [timestamps, setTimestamps] = useState([]);

  useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${tradingPair.replace("/", "").toLowerCase()}@trade`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const newPrice = parseFloat(data.p);
      const newTime = new Date().toLocaleTimeString();

    };

    return () => ws.close();
  }, [tradingPair]);

  return (
    <div className="w-full h-72 p-4 border rounded-lg shadow-lg bg-white">
      <Line
        data={{
          labels: timestamps,
          datasets: [
            {
              label: `${tradingPair} Price`,
              data: prices,
              borderColor: "rgb(75, 192, 192)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderWidth: 2,
            },
          ],
        }}
      />
    </div>
  );
};

export default TradingChart;
