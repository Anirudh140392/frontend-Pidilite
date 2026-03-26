import React, { useState, useEffect, useContext } from "react";
import TopTabs from "../../components/functional/negativeKeywords/topTabs";
import "../../styles/performanceOverview/performanceOverview.less";
import { NEGATIVETABS } from "../../lib/constant";
import ErrorBoundary from "../../components/common/erroBoundryComponent";
import { useLocation, useSearchParams } from "react-router";
import { Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import overviewContext from "../../../store/overview/overviewContext";
import SuggestedKeywordsDatatable from "../../components/functional/negativeKeywords/suggestedKeywordsDatatable";
import ExistingKeywordsDatatable from "../../components/functional/negativeKeywords/existingKeywordsDatatable";

const NegativeKeywordsComponent = () => {
    const location = useLocation();
    const [showActiveTab, setShowActiveTab] = useState(NEGATIVETABS.SUGGESTED);
    const [operatorName, setoperatorName] = useState("");
    const [searchParams, setSearchParams] = useSearchParams();
    const { dateRange } = useContext(overviewContext) || {
        dateRange: [{ startDate: new Date(), endDate: new Date() }],
    };

    const selectedBrand = searchParams.get("brand") || "";

    const FLIPKART_BRANDS = [
        "All Brands",
        "wd40",
        "fevicryl",
        "Fevicreate",
        "fevicol",
        "Cera Clean",
        "Motomax",
        "WD",
        "stain off",
        "roff",
        "stainoff",
        "shoefix"
    ];

    const daysDifference = () => {
        if (!dateRange?.length) return 0;
        const startDate = new Date(dateRange[0].startDate);
        const endDate = new Date(dateRange[0].endDate);
        const diff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        return diff === 6 ? diff + 1 : diff;
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const operator = params.get("operator");
        const tab = params.get("tab");

        if (operator) setoperatorName(operator);

        if (tab && NEGATIVETABS[tab.toUpperCase()]) {
            setShowActiveTab(NEGATIVETABS[tab.toUpperCase()]);
        }
    }, [location.search]);

    return (
        <React.Fragment>
            <div className="container">
                <div className="card">
                    <div className="card-body">
                        <div className="border-bottom py-1 position-relative d-flex justify-content-between align-items-center">
                            <small className="d-inline-block py-1 px-2 bg-light rounded-pill">
                                Report Date = Last {daysDifference()} Days
                            </small>
                            {operatorName === "Flipkart" && (
                                <Box sx={{ p: 1, display: "flex", justifyContent: "flex-end" }}>
                                    <FormControl size="small" variant="outlined" sx={{ minWidth: 200 }}>
                                        <InputLabel id="brand-select-label">Brand Filter</InputLabel>
                                        <Select
                                            labelId="brand-select-label"
                                            value={selectedBrand === "" ? "All Brands" : selectedBrand}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const newParams = new URLSearchParams(searchParams);
                                                if (val === "All Brands") {
                                                    newParams.delete("brand");
                                                } else {
                                                    newParams.set("brand", val);
                                                }
                                                setSearchParams(newParams);
                                            }}
                                            label="Brand Filter"
                                        >
                                            {FLIPKART_BRANDS.map((brand) => (
                                                <MenuItem key={brand} value={brand}>
                                                    {brand}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                            )}
                        </div>
                        <TopTabs
                            showActiveTab={showActiveTab}
                            setShowActiveTab={setShowActiveTab}
                            operatorName={operatorName}
                        />
                        {showActiveTab === NEGATIVETABS.SUGGESTED && (
                            <ErrorBoundary>
                                <SuggestedKeywordsDatatable />
                            </ErrorBoundary>
                        )}
                        {showActiveTab === NEGATIVETABS.EXISTING && (
                            <ErrorBoundary>
                                <ExistingKeywordsDatatable />
                            </ErrorBoundary>
                        )}
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default NegativeKeywordsComponent;
