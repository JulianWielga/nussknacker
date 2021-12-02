import { ViewList } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import { Breadcrumbs, Grid, Link, Skeleton, Typography } from "@mui/material";
import InputBase from "@mui/material/InputBase";
import Paper from "@mui/material/Paper";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { Link as RouterLink, Navigate, useParams, useSearchParams } from "react-router-dom";
import { useBackHref } from "../common";
import { UsagesTable } from "./usagesTable";
import { useComponentQuery, useComponentUsagesQuery } from "./useComponentsQuery";
import { useDebouncedValue } from "rooks";
import { deserializeFromQuery, serializeToQuery } from "./filters/filtersContext";

export function ComponentView(): JSX.Element {
    const { componentId } = useParams<"componentId">();
    const { data = [], isLoading } = useComponentUsagesQuery(componentId);
    const { data: component, isLoading: componentLoading } = useComponentQuery(componentId);
    const back = useBackHref();

    const [searchParams, setSearchParams] = useSearchParams();
    const [filter, setFilter] = useState(deserializeFromQuery<{ FILTER?: string }>(searchParams));
    const [debouncedFilter] = useDebouncedValue(filter, 250, { initializeWithNull: true });
    useEffect(() => {
        setFilter(deserializeFromQuery(searchParams));
    }, [searchParams]);

    useLayoutEffect(() => {
        debouncedFilter && setSearchParams(serializeToQuery(debouncedFilter), { replace: true });
    }, [debouncedFilter, setSearchParams]);

    return (
        <>
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
                <Grid item xs={12} sm={4}>
                    <CustomizedInputBase value={filter?.FILTER} onChange={(FILTER) => setFilter({ FILTER })} />
                </Grid>
            </Grid>
            <UsagesTable data={data} isLoading={isLoading} filter={filter?.FILTER} />
        </>
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
