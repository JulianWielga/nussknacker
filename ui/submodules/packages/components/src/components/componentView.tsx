import { ViewList } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import { Breadcrumbs, Grid, Link, Skeleton, Typography } from "@mui/material";
import InputBase from "@mui/material/InputBase";
import Paper from "@mui/material/Paper";
import React from "react";
import { Link as RouterLink, Navigate, useParams } from "react-router-dom";
import { useBackHref } from "../common";
import { UsagesTable } from "./usagesTable";
import { useComponentQuery, useComponentUsagesQuery } from "./useComponentsQuery";
import { FiltersContextProvider, useFilterContext } from "./filters/filtersContext";

function Filters() {
    const { getFilter, setFilter } = useFilterContext();
    return (
        <Grid item xs={12} sm={4}>
            <CustomizedInputBase value={getFilter("TEXT") || ""} onChange={setFilter("TEXT")} />
        </Grid>
    );
}

export function ComponentView(): JSX.Element {
    const { componentId } = useParams<"componentId">();
    const { data = [], isLoading } = useComponentUsagesQuery(componentId);
    const { data: component, isLoading: componentLoading } = useComponentQuery(componentId);
    const back = useBackHref();

    return (
        <FiltersContextProvider>
            <Grid container direction="row" justifyContent="space-between" alignItems="flex-end">
                <Grid item>
                    <Breadcrumbs
                        aria-label="breadcrumb"
                        sx={{ color: (theme) => theme.palette.getContrastText(theme.palette.background.default) }}
                    >
                        <Link
                            component={RouterLink}
                            to={back}
                            underline="hover"
                            color="inherit"
                            sx={{ display: "flex", alignItems: "center" }}
                        >
                            <ViewList sx={{ mr: 0.5 }} fontSize="inherit" />
                            Components
                        </Link>
                        <Typography color="inherit">
                            {componentLoading ? (
                                <Skeleton width={componentId.length * 6} animation="wave" />
                            ) : (
                                <>{component ? <strong>{component.name}</strong> : <Navigate replace to="/404" />}</>
                            )}
                        </Typography>
                        <Typography color="inherit">usages</Typography>
                    </Breadcrumbs>
                </Grid>
                <Filters />
            </Grid>
            <UsagesTable data={data} isLoading={isLoading} />
        </FiltersContextProvider>
    );
}

export default function CustomizedInputBase({ value, onChange }) {
    return (
        <Paper sx={{ px: 1, pt: 0.5, flex: 1, display: "flex", alignItems: "center" }} elevation={0}>
            <SearchIcon fontSize="small" />
            <InputBase
                value={value}
                onChange={(e) => onChange(e.target.value)}
                sx={{ pl: 1, flex: 1 }}
                placeholder="Filter..."
                inputProps={{ "aria-label": "filter" }}
            />
        </Paper>
    );
}
