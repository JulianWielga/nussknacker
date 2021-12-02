import { DateTime } from "luxon";
import type { ComponentUsageType } from "nussknackerUi/HttpService";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CustomCell } from "./cellRenderers/categoriesCell";
import { ScenarioCell } from "./cellRenderers/scenarioCell";
import { Column, Columns, TableViewData, TableWrapper } from "./tableWrapper";

const dateTimeColumn = <R extends any>(def: Column<R>): Column<R> => ({
    ...def,
    type: "dateTime",
    flex: 1,
    valueGetter: ({ value }) => value && new Date(value),
    valueFormatter: ({ value: date }) => DateTime.fromJSDate(date as Date).toFormat("yyyy-MM-dd HH:mm:ss"),
});

export function UsagesTable(props: TableViewData<ComponentUsageType> & { filter?: string }): JSX.Element {
    const { data = [], isLoading } = props;
    const { t } = useTranslation();

    const columns = useMemo(
        (): Columns<ComponentUsageType[]> => [
            {
                field: "name",
                cellClassName: "noPadding stretch",
                headerName: t("table.usages.title.NAME", "Name"),
                flex: 2,
                renderCell: ScenarioCell,
            },
            {
                field: "processCategory",
                headerName: t("table.usages.title.PROCESS_CATEGORY", "Process category"),
            },
            dateTimeColumn({
                field: "modificationDate",
                headerName: t("table.usages.title.MODIFICATION_DATE", "Modification date"),
            }),
            dateTimeColumn({
                field: "createdAt",
                headerName: t("table.usages.title.CREATED_AT", "Created at"),
            }),
            {
                field: "createdBy",
                headerName: t("table.usages.title.CREATED_BY", "Created by"),
            },
            {
                field: "nodesId",
                headerName: t("table.usages.title.NODES_ID", "Nodes"),
                minWidth: 250,
                flex: 2,
                sortComparator: (v1: string[], v2: string[]) => v1.length - v2.length,
                renderCell: CustomCell,
            },
        ],
        [t],
    );

    return (
        <TableWrapper<ComponentUsageType>
            columns={columns}
            data={data}
            isLoading={isLoading}
            dataFilter={
                props.filter
                    ? (row) =>
                          Object.values(row)
                              .filter(Boolean)
                              .map((v) => v.toString().toLowerCase())
                              .some((value) => value.includes(props.filter.toLowerCase()))
                    : null
            }
        />
    );
}
