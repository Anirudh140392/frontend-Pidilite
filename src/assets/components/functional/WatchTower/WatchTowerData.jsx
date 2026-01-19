import { useContext } from "react";
import overviewContext from "../../../../store/overview/overviewContext";
import TowerByCategory from "./TowerByCategory";
import TowerForAll from "./TowerForAll";
import TowerPlatformOverview from "./TowerPlatformOverview";

const WatchTowerData = () => {
  // Get dateRange and formatDate from context
  const { dateRange, formatDate } = useContext(overviewContext) || {
    dateRange: [{ startDate: new Date(), endDate: new Date() }],
    formatDate: (date) => date.toISOString().split('T')[0],
  };

  return (
    <>
      <TowerForAll dateRange={dateRange} formatDate={formatDate} />
      <TowerPlatformOverview dateRange={dateRange} formatDate={formatDate} />
      <TowerByCategory dateRange={dateRange} formatDate={formatDate} />
    </>
  );
};

export default WatchTowerData;
