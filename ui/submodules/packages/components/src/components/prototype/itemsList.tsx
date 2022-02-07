import { FirstLine, SecondLine } from "./item";
import React, { useCallback, useMemo } from "react";
import { RowType } from "./prototype";
import { useFilterContext } from "../filters/filtersContext";
import { FilterRules } from "../filters/filterRules";
import ListItem from "@mui/material/ListItem";
import Paper from "@mui/material/Paper";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import { orderBy } from "lodash";
import { List as VList, WindowScroller } from "react-virtualized";
import { useScrollParent } from "./useScrollParent";
import IconButton from "@mui/material/IconButton";
import AssessmentIcon from "@mui/icons-material/Assessment";
import MediationIcon from "@mui/icons-material/Mediation";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import { Avatar, Box, ListItemAvatar } from "@mui/material";

function ListRow({ row }: { row: RowType }): JSX.Element {
    return (
        <ListItem
            disablePadding
            sx={{
                opacity: row.isArchived ? 0.5 : 1,
            }}
            secondaryAction={
                !row.isSubprocess && (
                    <IconButton>
                        <AssessmentIcon />
                    </IconButton>
                )
            }
        >
            <ListItemButton onClick={console.log}>
                <ListItemAvatar>
                    <Avatar
                        variant="rounded"
                        sx={{
                            bgcolor: row.isArchived ? "action.disabledBackground" : row.isSubprocess ? "secondary.dark" : "secondary.light",
                            color: row.isArchived ? "action.disabled" : row.isSubprocess && "secondary.contrastText",
                        }}
                    >
                        {row.isSubprocess ? <MediationIcon titleAccess="fragment" /> : <AccountTreeIcon titleAccess="scenario" />}
                    </Avatar>
                </ListItemAvatar>
                <ListItemText primary={<FirstLine row={row} />} secondary={<SecondLine row={row} />} />
            </ListItemButton>
        </ListItem>
    );
}

function Extracted({
    width,
    isScrolling,
    scrollTop,
    height,
    onChildScroll,
    rows,
}: {
    width: number;
    isScrolling: boolean;
    scrollTop: number;
    height: number;
    onChildScroll: (params: { scrollTop: number }) => void;
    rows: any[];
}) {
    const rrows = useMemo(() => rows.map((r) => <ListRow key={r.id} row={r} />), [rows]);
    const RowRenderer1 = useCallback(
        ({ index, key, style }) => (
            <Box key={key} style={style} sx={{ height: 72.02 }}>
                {rrows[index]}
            </Box>
        ),
        [rrows],
    );
    return (
        <>
            <VList
                autoWidth
                autoHeight
                width={width}
                height={height}
                isScrolling={isScrolling}
                onScroll={onChildScroll}
                scrollTop={scrollTop}
                rowCount={rows?.length}
                rowHeight={72.02}
                rowRenderer={RowRenderer1}
            />
        </>
    );
}

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
    const sorted = useMemo(() => orderBy(filtered, (row) => row.createdAt, "desc"), [filtered]);
    const rows = sorted;

    const { scrollParent, ref } = useScrollParent();

    return (
        <div ref={ref}>
            <Paper sx={{ flex: 1 }}>
                <WindowScroller scrollElement={scrollParent}>
                    {({ height = 0, width = 0, isScrolling, onChildScroll, scrollTop }) => (
                        <Extracted
                            height={height}
                            width={width}
                            isScrolling={isScrolling}
                            onChildScroll={onChildScroll}
                            rows={rows}
                            scrollTop={scrollTop}
                        />
                    )}
                </WindowScroller>
            </Paper>
        </div>
    );
}
