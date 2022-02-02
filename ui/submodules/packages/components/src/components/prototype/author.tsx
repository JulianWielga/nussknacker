import { useFilterContext } from "../filters/filtersContext";
import React, { useCallback, useMemo } from "react";
import { Typography } from "@mui/material";

export function Author({ value }: { value: string }): JSX.Element {
    const { setFilter, getFilter } = useFilterContext();
    const filterValue = useMemo(() => getFilter("CREATED_BY", true), [getFilter]);
    const isSelected = useMemo(() => filterValue.includes(value), [filterValue, value]);

    const onClick = useCallback((e) => {
        setFilter("CREATED_BY", isSelected ? filterValue.filter((val) => val !== value) : [...filterValue, value]);
        e.stopPropagation();
    }, [filterValue, isSelected, value, setFilter]);

    return (
        <Typography
            component="a"
            variant="body2"
            sx={{ color: isSelected ? "primary.main" : "inherit" }}
            tabIndex={0}
            onClick={onClick}
        >
            {value}
        </Typography>
    );
}
