import { useState, useEffect } from "react";
import { Card, Container, Spinner, Alert } from "react-bootstrap";
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { fetchWatchTowerData } from "../../../../services/WatchTowerService";
import {
  formatCurrency,
  formatChangeWithValue,
  formatLargeNumber,
  formatROAS,
  formatPercentage,
  transformGraphData,
  getChangeColorClass,
  formatUnits,
} from "../../../../utils/formatters";

const TowerForAll = ({ dateRange, formatDate }) => {
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Use dateRange from props (header calendar)
        const startDate = formatDate(dateRange[0].startDate);
        const endDate = formatDate(dateRange[0].endDate);

        const data = await fetchWatchTowerData(startDate, endDate);
        setApiData(data);
        setError(null);
      } catch (err) {
        setError('Failed to load Watch Tower data. Please try again later.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange, formatDate]);

  // Transform API data to cards format
  const cards = apiData?.overview_metrics?.All
    ? [
      {
        title: "Offtake",
        value: formatCurrency(apiData.overview_metrics.All.Offtake),
        sub: "for MTD",
        change: formatPercentage(apiData.overview_metrics.All.Offtake_change),
        changeColor: getChangeColorClass(apiData.overview_metrics.All.Offtake_change),
        prevText: "vs Previous Month",
        extra: `#Units: ${formatUnits(apiData.overview_metrics.All.Offtake_units)}`,
        extraChange: formatPercentage(apiData.overview_metrics.All.Offtake_change),
        extraChangeColor: getChangeColorClass(apiData.overview_metrics.All.Offtake_change),
        chartData: transformGraphData(apiData.overview_metrics.All.Offtake_graph),
      },
      {
        title: "Ad Spends",
        value: formatCurrency(apiData.overview_metrics.All.Ad_Spends),
        sub: "for MTD",
        change: formatPercentage(apiData.overview_metrics.All.Ad_Spends_change),
        changeColor: getChangeColorClass(apiData.overview_metrics.All.Ad_Spends_change),
        prevText: "vs Previous Month",
        chartData: transformGraphData(apiData.overview_metrics.All.Ad_Spends_graph),
      },
      {
        title: "ROAS",
        value: formatROAS(apiData.overview_metrics.All.ROAS),
        sub: "for MTD (Avg.)",
        change: formatPercentage(apiData.overview_metrics.All.ROAS_change),
        changeColor: getChangeColorClass(apiData.overview_metrics.All.ROAS_change),
        prevText: "vs Previous Month",
        chartData: transformGraphData(apiData.overview_metrics.All.ROAS_graph),
      },
      {
        title: "Impressions",
        value: formatLargeNumber(apiData.overview_metrics.All.Impressions * 1000000),
        sub: "for MTD",
        change: formatPercentage(apiData.overview_metrics.All.Impressions_change),
        changeColor: getChangeColorClass(apiData.overview_metrics.All.Impressions_change),
        prevText: "vs Previous Month",
        chartData: transformGraphData(apiData.overview_metrics.All.Impressions_graph),
      },
      {
        title: "Orders",
        value: formatLargeNumber(apiData.overview_metrics.All.Orders * 1000),
        sub: "for MTD",
        change: formatPercentage(apiData.overview_metrics.All.Orders_change),
        changeColor: getChangeColorClass(apiData.overview_metrics.All.Orders_change),
        prevText: "vs Previous Month",
        chartData: transformGraphData(apiData.overview_metrics.All.Orders_graph),
      },
    ]
    : [];

  const isProfit = (changeText) => {
    if (!changeText) return true;
    return changeText.includes("▲") || changeText.includes("+");
  };

  const scrollNeeded = cards.length > 5;

  if (loading) {
    return (
      <Container fluid className="py-4">
        <Card className="border-0 shadow-lg rounded-4 p-4 bg-white text-center">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-muted">Loading Watch Tower data...</p>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger" className="rounded-4">
          <Alert.Heading>Error Loading Data</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Card className="border-0 shadow-lg rounded-4 p-4 bg-white">
        {/* ===== Header ===== */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center">
            <div
              className="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center me-2"
              style={{ width: "36px", height: "36px" }}
            >
              <i className="bi bi-graph-up"></i>
            </div>
            <h5 className="mb-0 fw-semibold text-dark">Watchtower Overview</h5>
            <span className="badge bg-light text-dark ms-2">All</span>
          </div>
          <div className="bg-light rounded-pill px-3 py-1 small shadow-sm">
            <span className="fw-semibold text-dark">MTD</span>{" "}
            <span className="text-muted">vs Previous Month</span>
          </div>
        </div>

        {/* ===== Cards Row ===== */}
        <div
          className="d-flex pb-3"
          style={{
            gap: "1rem",
            overflowX: scrollNeeded ? "auto" : "hidden",
            flexWrap: "nowrap",
            scrollSnapType: scrollNeeded ? "x mandatory" : "none",
          }}
        >
          {cards.map((card, index) => {
            const profit = isProfit(card.change);
            const lineColor = profit ? "#28a745" : "#dc3545";

            return (
              <Card
                key={index}
                className="border-0 shadow-sm rounded-4 hover-card flex-shrink-0"
                style={{
                  width: scrollNeeded
                    ? "250px"
                    : `${100 / Math.min(cards.length, 5) - 1}%`,
                  scrollSnapAlign: "start",
                }}
              >
                <Card.Body className="p-3">
                  <Card.Title className="fs-6 text-muted mb-2">
                    {card.title}
                  </Card.Title>

                  <h4 className="fw-semibold mb-0 text-dark">
                    {card.value}{" "}
                    <span className="fs-6 text-muted fw-normal">
                      {card.sub}
                    </span>
                  </h4>

                  <p className={`small mt-2 mb-1 ${card.changeColor}`}>
                    {card.change}{" "}
                    <span className="text-muted">{card.prevText}</span>
                  </p>

                  {card.extra && (
                    <p className="small mb-2 text-secondary">
                      {card.extra}{" "}
                      <span className={card.extraChangeColor}>
                        {card.extraChange}
                      </span>
                    </p>
                  )}

                  {/* Mini Line Chart */}
                  <div style={{ height: 80 }} className="mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={card.chartData}>
                        <XAxis dataKey="name" hide />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #ddd",
                            fontSize: "12px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={lineColor}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      </Card>

      <style>
        {`
          .hover-card {
            transition: transform 0.25s ease, box-shadow 0.25s ease;
          }
          .hover-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 0.75rem 1.25rem rgba(0,0,0,0.15);
          }

          /* optional: smooth scroll */
          .d-flex::-webkit-scrollbar {
            height: 8px;
          }
          .d-flex::-webkit-scrollbar-thumb {
            background-color: rgba(0,0,0,0.2);
            border-radius: 4px;
          }
        `}
      </style>
    </Container>
  );
};

export default TowerForAll;
