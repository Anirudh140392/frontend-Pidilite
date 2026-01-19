import { useState, useEffect } from "react";
import { Card, Container, Button, Spinner, Alert } from "react-bootstrap";
import {
  BsGrid3X3GapFill,
  BsSearch,
  BsInfoCircle,
  BsCalendar,
} from "react-icons/bs";
import { fetchWatchTowerData } from "../../../../services/WatchTowerService";
import {
  formatCurrency,
  formatPercentage,
  formatLargeNumber,
  formatROAS,
  getChangeColorClass,
  formatUnits,
} from "../../../../utils/formatters";

const TowerPlatformOverview = ({ dateRange, formatDate }) => {
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
        setError('Failed to load platform data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange, formatDate]);

  // Transform API data to platform format
  const transformPlatformData = () => {
    if (!apiData?.overview_metrics) return [];

    const platformConfigs = [
      {
        key: "all",
        label: "All",
        logo: "https://cdn-icons-png.flaticon.com/512/711/711284.png",
        apiKey: "All",
      },
      {
        key: "blinkit",
        label: "Blinkit",
        logo: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Blinkit-yellow-rounded.svg",
        apiKey: "Blinkit",
      },
      {
        key: "zepto",
        label: "Zepto",
        logo: "https://upload.wikimedia.org/wikipedia/en/7/7d/Logo_of_Zepto.png",
        apiKey: "Zepto",
      },
      {
        key: "instamart",
        label: "Instamart",
        logo: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Swiggy_Logo_2024.webp",
        apiKey: "Instamart",
      },
    ];

    return platformConfigs.map((config) => {
      const platformData = apiData.overview_metrics[config.apiKey];

      if (!platformData) {
        return {
          ...config,
          columns: [],
        };
      }

      return {
        ...config,
        columns: [
          {
            title: "Offtake",
            value: formatCurrency(platformData.Offtake),
            change: {
              text: formatPercentage(platformData.Offtake_change),
              positive: platformData.Offtake_change >= 0,
            },
            meta: {
              units: formatUnits(platformData.Offtake_units),
              change: formatPercentage(platformData.Offtake_change),
            },
          },
          {
            title: "Impressions",
            value: formatLargeNumber(platformData.Impressions * 1000000),
            change: {
              text: formatPercentage(platformData.Impressions_change),
              positive: platformData.Impressions_change >= 0,
            },
            meta: null,
          },
          {
            title: "Orders",
            value: formatLargeNumber(platformData.Orders * 1000),
            change: {
              text: formatPercentage(platformData.Orders_change),
              positive: platformData.Orders_change >= 0,
            },
            meta: null,
          },
          {
            title: "Ad Spends",
            value: formatCurrency(platformData.Ad_Spends),
            change: {
              text: formatPercentage(platformData.Ad_Spends_change),
              positive: platformData.Ad_Spends_change >= 0,
            },
            meta: null,
          },
          {
            title: "ROAS",
            value: formatROAS(platformData.ROAS),
            change: {
              text: formatPercentage(platformData.ROAS_change),
              positive: platformData.ROAS_change >= 0,
            },
            meta: null,
          },
        ],
      };
    });
  };

  const platforms = transformPlatformData();

  const SmallCard = ({ item }) => {
    const { title, value, change, meta } = item;
    const hasValue = value !== null && value !== undefined && value !== "N/A";

    return (
      <Card className="mb-3" style={{ borderRadius: 12, height: 69.5 }}>
        <Card.Body style={{ padding: "0.9rem" }}>
          <div className="fw-bold" style={{ fontSize: "1.05rem" }}>
            {hasValue ? (
              value
            ) : (
              <span className="text-secondary small">No Data Available</span>
            )}
          </div>
          {hasValue && change && change.text && change.text !== "N/A" && (
            <div className="small mt-1">
              <span
                className={
                  change.positive
                    ? "text-success"
                    : "text-danger"
                }
              >
                {change.text}
              </span>
            </div>
          )}
        </Card.Body>
      </Card>
    );
  };

  if (loading) {
    return (
      <Container fluid className="py-2">
        <Card className="border-0 shadow-lg rounded-4 p-4 bg-white text-center">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-muted">Loading platform data...</p>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-2">
        <Alert variant="danger" className="rounded-4">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-2">
      <Card
        className="border-0 shadow-lg rounded-4 p-3 bg-white"
        style={{
          borderRadius: 10,
          height: 740,
          border: "1px solid #e5e5e5",
        }}
      >
        <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
          <div className="d-flex align-items-center">
            <div
              className="bg-light rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: 40, height: 40 }}
            >
              <BsGrid3X3GapFill size={20} color="#0d6efd" />
            </div>
            <div className="ms-2 fw-semibold" style={{ fontSize: "1.1rem" }}>
              Platform Overview
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div
              className="d-flex align-items-center px-2 py-1 rounded text-muted small"
              style={{
                backgroundColor: "#f8f3f0",
                border: "1px solid #e3dad6",
                fontWeight: 500,
              }}
            >
              <BsCalendar className="me-1" /> Stale Data
            </div>
            <div
              className="d-flex align-items-center bg-light rounded-pill px-2"
              style={{
                backgroundColor: "#f2f6fb",
                border: "1px solid #dee2e6",
                height: 34,
                width: 220,
              }}
            >
              <input
                type="text"
                className="form-control border-0 bg-transparent shadow-none"
                placeholder="Search"
                style={{ fontSize: "0.85rem" }}
              />
              <BsSearch size={15} color="#6c757d" />
            </div>
          </div>
        </div>
        <div
          style={{
            overflowX: "auto",
            paddingBottom: 8,
            WebkitOverflowScrolling: "touch",
          }}
        >
          <div
            className="d-flex flex-nowrap align-items-start"
            style={{
              gap: 12,
              minWidth: "100%",
            }}
          >
            <div
              className="flex-shrink-0 position-sticky bg-white"
              style={{
                width: 160,
                minWidth: 140,
                left: 0,
                top: 0,
                zIndex: 5,
                boxShadow: "4px 0 6px -3px rgba(0,0,0,0.1)",
              }}
            >
              <div className="d-grid gap-3">
                <div
                  className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2"
                  style={{
                    width: 42,
                    height: 34,
                    position: "sticky",
                    top: 8,
                    zIndex: 6,
                    background: "#fff",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  }}
                >
                  <BsGrid3X3GapFill size={18} className="text-secondary" />
                </div>

                {platforms[0]?.columns.map((metric, i) => (
                  <Button
                    key={i}
                    variant="light"
                    className="text-start small border w-100 mb-3"
                    style={{
                      borderRadius: 10,
                      padding: "0.65rem 0.75rem",
                      height: 85,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: "#fff",
                    }}
                  >
                    <span>{metric.title}</span>
                    <BsInfoCircle size={13} className="text-muted" />
                  </Button>
                ))}
              </div>
            </div>

            {platforms.map((platform) => (
              <div
                key={platform.key}
                className="flex-shrink-0"
                style={{
                  width: "min(260px, 45vw)",
                  minWidth: 220,
                  display: "flex",
                  flexDirection: "column",
                  zIndex: 4,
                  gap: 8,
                }}
              >
                <div
                  className="p-2 h-100"
                  style={{
                    border: "1px solid #e5e5e5",
                    borderRadius: 12,
                    background: "#f9fafb",
                    marginRight: 12,
                    overflowY: "auto",
                    scrollbarWidth: "thin",
                  }}
                >
                  <div
                    className="mb-2"
                    style={{
                      position: "sticky",
                      top: 4,
                      zIndex: 10,
                      background: "#f9fafb",
                    }}
                  >
                    <Card
                      className="d-flex align-items-center justify-content-center px-3 py-2"
                      style={{
                        borderRadius: 10,
                        border:
                          platform.key === "all"
                            ? "2px solid #0d6efd"
                            : "1px solid #e0e0e0",
                        background:
                          platform.key === "all" ? "#0d6efd" : "#ffffff",
                        color: platform.key === "all" ? "#ffffff" : "#000000",
                        transition: "0.2s ease",
                      }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={platform.logo}
                          alt={`${platform.label} logo`}
                          style={{
                            width: 28,
                            height: 28,
                            objectFit: "contain",
                            borderRadius: "50%",
                            background: "#fff",
                            padding: 2,
                          }}
                        />
                        <div
                          className="fw-semibold"
                          style={{ fontSize: "0.9rem", whiteSpace: "nowrap" }}
                        >
                          {platform.label}
                        </div>
                      </div>
                    </Card>
                  </div>

                  {platform.columns.map((c, i) => (
                    <Card
                      key={i}
                      className="shadow-sm"
                      style={{
                        borderRadius: 10,
                        border: "1px solid #e0e0e0",
                        background: "#ffffff",
                        marginBottom: 8,
                        transition: "transform 0.1s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "scale(1.02)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
                    >
                      <Card.Body className="py-2 px-3">
                        <SmallCard item={c} />
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </Container>
  );
};

export default TowerPlatformOverview;
