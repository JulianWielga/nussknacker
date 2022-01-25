import { FirstLine, SecondLine } from "./item";
import React, { useCallback, useMemo } from "react";
import { RowType } from "./prototype";
import { useFilterContext } from "../filters/filtersContext";
import { FilterRules } from "../filters/filterRules";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Paper from "@mui/material/Paper";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";

export function ItemsList(props: { data: RowType[]; isLoading?: boolean; filterRules?: FilterRules<RowType> }): JSX.Element {
    const { data = [], filterRules, isLoading } = props;
    const { model } = useFilterContext();
    const dataFilter = useCallback(
        (row) =>
            !filterRules ||
            Object.keys(filterRules).every((id) => {
                const check = filterRules[id];
                const value = model[id];
                return check ? check(row, value) : true;
            }),
        [filterRules, model],
    );
    const filtered = useMemo(() => (dataFilter ? data.filter(dataFilter) : data), [data, dataFilter]);

    return (
        <Paper>
            <List>
                {filtered.map((row) => (
                    <ListItem key={row.id} disablePadding>
                        <ListItemButton>
                            <ListItemText primary={<FirstLine row={row} />} secondary={<SecondLine row={row} />} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
}
