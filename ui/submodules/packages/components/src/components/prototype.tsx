import Grid from "@mui/material/Grid";
import React, { useMemo } from "react";
import { Columns, TableViewData, TableWrapper } from "./tableWrapper";
import { FilterRules } from "./filters/filterRules";
import { useScenariosQuery } from "./useComponentsQuery";
import { FiltersContextProvider } from "./filters/filtersContext";
import InputBase from "@mui/material/InputBase";

export function Prototype() {
    const { data = [], isLoading } = useScenariosQuery();

    return (
        <>
            <FiltersContextProvider>
                <Grid container direction="row" justifyContent="space-between" alignItems="flex-end">
                    <Grid item>
                        <h1>test</h1>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <h2>test2</h2>
                    </Grid>
                </Grid>
                {/*<TableView data={data} isLoading={isLoading} />*/}
            </FiltersContextProvider>
        </>

    );
}

interface RowType {
    id: string,
    name: string,
    xxx: string
}

function TableView(props: TableViewData<RowType>): JSX.Element {
    const { data = [], isLoading } = props;

    const columns = useMemo(
        (): Columns<RowType> => [
            {
                field: "id",
                hideable: false,
                flex: 1,
                renderCell: (props) => <div>{props.value}</div>,
            },
        ],
        [],
    );

    const filterRules = useMemo<FilterRules<RowType>>(
        () => ({
            TEXT: (row, filter) =>
                !filter?.toString().length ||
                columns
                    .map(({ field }) => row[field]?.toString().toLowerCase())
                    .filter(Boolean)
                    .some((value) => value.includes(filter.toString().toLowerCase())),
        }),
        [columns],
    );

    return (
        <TableWrapper<RowType>
            columns={columns}
            data={data}
            isLoading={isLoading}
            filterRules={filterRules}
            disableZebra
            headerHeight={0}
            components={{
                Toolbar: CustomToolbar,
            }}
        />
    );
}

function CustomToolbar() {
    return (
        <>
            <InputBase
                sx={{ width: "100%", p: 1 }}
            />
        </>
    );
}
