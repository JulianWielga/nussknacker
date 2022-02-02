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
import { List as VList, ListRowProps, WindowScroller } from "react-virtualized";
import { useScrollParent } from "./useScrollParent";
import IconButton from "@mui/material/IconButton";
import AssessmentIcon from "@mui/icons-material/Assessment";
import MediationIcon from "@mui/icons-material/Mediation";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import { Avatar, AvatarGroup, Badge, ListItemAvatar, styled } from "@mui/material";
import { useScenariosStatusesQuery } from "../useComponentsQuery";
import { IconImg } from "../cellRenderers/iconImg";


function ListRow({ style, row }: { style: React.CSSProperties, row: RowType }): JSX.Element {
    return (
        <ListItem
            style={style}
            disablePadding
            sx={{
                opacity: row.isArchived ? .5 : 1,
            }}
            secondaryAction={!row.isSubprocess && <IconButton>
                <AssessmentIcon />
            </IconButton>}

        >
            <ListItemButton onClick={console.log}>
                <ListItemAvatar>
                    <Avatar variant="rounded"
                            sx={{
                                bgcolor: row.isArchived ? "action.disabledBackground" : row.isSubprocess ? "secondary.dark" : "secondary.light",
                                color: row.isArchived ? "action.disabled" : row.isSubprocess && "secondary.contrastText",
                            }}>
                        {row.isSubprocess ? <MediationIcon titleAccess="fragment" /> :
                            <AccountTreeIcon titleAccess="scenario" />}
                    </Avatar>
                </ListItemAvatar>
                <ListItemText primary={<FirstLine row={row} />} secondary={<SecondLine row={row} />} />
            </ListItemButton>
        </ListItem>
    );
}

const renderRow = (rows: RowType[]) => ({ index, style }: ListRowProps) => (
    <ListRow
        key={index}
        style={style}
        row={rows[index]}
    />
);

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

    const [getScrollParent, bindElements, currentElement] = useScrollParent();
    const rowRenderer = useMemo(() => renderRow(rows), [rows]);
    const scrollParent = getScrollParent();
    return (
        <>
            {data.length ? (
                <Paper ref={bindElements} sx={{ flex: 1 }}>
                    <>
                        {/*<List>*/}
                        {/*    {rows.map((row) => (*/}
                        {/*        <ListItem*/}
                        {/*            key={row.id}*/}
                        {/*            disablePadding*/}
                        {/*            sx={{*/}
                        {/*                color: row.isArchived ? "warning.main" : "inherit",*/}
                        {/*            }}*/}
                        {/*        >*/}
                        {/*            <ListItemButton>*/}
                        {/*                <ListItemText primary={<FirstLine row={row} />} secondary={<SecondLine row={row} />} />*/}
                        {/*            </ListItemButton>*/}
                        {/*        </ListItem>*/}
                        {/*    ))}*/}
                        {/*</List>*/}
                    </>
                    <WindowScroller scrollElement={scrollParent}>
                        {({ height, width, isScrolling, onChildScroll, scrollTop }) => {
                            return (
                                <VList
                                    autoWidth
                                    autoHeight
                                    width={width}
                                    height={height}
                                    isScrolling={isScrolling}
                                    onScroll={onChildScroll}
                                    scrollTop={scrollTop}
                                    rowCount={rows.length}
                                    rowHeight={72.02}
                                    rowRenderer={rowRenderer}
                                />
                            );
                        }}
                    </WindowScroller>
                </Paper>
            ) : null}
        </>
    );
}
