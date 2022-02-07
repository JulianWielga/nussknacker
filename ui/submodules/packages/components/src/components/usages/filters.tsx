import { useFilterContext } from "../filters/filtersContext";
import React, { ChangeEvent, PropsWithChildren, useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";
import Paper from "@mui/material/Paper";
import { useTranslation } from "react-i18next";
import { Checkbox, Fade, FormControlLabel, IconButton, InputAdornment, Stack, Typography } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { TextFieldWithClear } from "../../common";
import { SelectFilter2 } from "../selectFilter";
import { useScrollParent } from "../prototype/useScrollParent";

export function Filters(): JSX.Element {
    const { t } = useTranslation();
    const { getFilter, setFilter } = useFilterContext();
    const setText = useMemo(() => setFilter("TEXT"), [setFilter]);
    const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => setText(e.target.value), [setText]);
    const reset = useCallback(() => setText(null), [setText]);
    const preventDefault = useCallback((event) => event.preventDefault(), []);
    const value = getFilter("TEXT") || "";
    return (
        <Paper sx={{ px: 1.5, py: 1, flex: 1, display: "flex", alignItems: "center" }} elevation={0}>
            <SearchIcon fontSize="small" />
            <InputBase
                value={value}
                onChange={onChange}
                sx={{ pl: 1, flex: 1 }}
                placeholder={t("table.filter.QUICK", "Filter...")}
                inputProps={{
                    "aria-label": "filter",
                    style: { padding: 0 },
                }}
                endAdornment={
                    value && (
                        <InputAdornment position="end">
                            <IconButton aria-label="clear" onClick={reset} onMouseDown={preventDefault} edge="end">
                                <ClearIcon />
                            </IconButton>
                        </InputAdornment>
                    )
                }
            />
        </Paper>
    );
}

export function QFilter({ children, ...props }: PropsWithChildren<unknown>): JSX.Element {
    const { t } = useTranslation();
    const { getFilter, setFilter } = useFilterContext();

    return (
        <>
            <Paper elevation={2} sx={{ position: "sticky", top: 0, zIndex: 2 }} {...props}>
                <Stack
                    component={"form"}
                    noValidate
                    autoComplete="off"
                    direction="row"
                    // divider={<Divider orientation="vertical" flexItem />}
                >
                    <TextFieldWithClear
                        label={t("table.filter.QUICK", "Filter...")}
                        variant="filled"
                        fullWidth
                        value={getFilter("TEXT") || ""}
                        onChange={setFilter("TEXT")}
                        InputProps={{
                            disableUnderline: true,
                        }}
                    />
                    {children}
                </Stack>
            </Paper>
        </>
    );
}

export function Filters2({ values = {}, visible }: { values: Record<string, string[]>; visible?: boolean }): JSX.Element {
    const { t } = useTranslation();

    const { getFilter, setFilter } = useFilterContext();
    const setArchivedFilter = useCallback(
        (e) => {
            setFilter("SHOW_ARCHIVED", e.target.checked);
        },
        [setFilter],
    );
    const setActiveFilter = useCallback(
        (e) => {
            setFilter("HIDE_ACTIVE", !e.target.checked);
        },
        [setFilter],
    );
    const setFragmentFilter = useCallback(
        (e) => {
            setFilter("HIDE_FRAGMENTS", !e.target.checked);
        },
        [setFilter],
    );
    const setScenariosFilter = useCallback(
        (e) => {
            setFilter("HIDE_SCENARIOS", !e.target.checked);
        },
        [setFilter],
    );

    const ref2 = useRef<HTMLDivElement>();
    const { ref, scrollParent } = useScrollParent<HTMLDivElement>();

    const [isScrolled, setIsScrolled] = useState(false);
    useLayoutEffect(() => {
        const listener = ({ target }) => {
            requestAnimationFrame(() => {
                const value = target?.scrollTop > 80;
                if (!value) {
                    ref2.current?.scrollTo(0, 0);
                }
                setIsScrolled(value);
            });
        };
        console.log(scrollParent);
        scrollParent?.addEventListener("scroll", listener);
        return () => scrollParent?.removeEventListener("scroll", listener);
    }, [scrollParent]);
    const clientHeight = scrollParent?.clientHeight;

    return (
        <div ref={ref}>
            <Fade in={visible}>
                <Stack
                    ref={ref2}
                    sx={{
                        overflowY: isScrolled && clientHeight > 0 ? "auto" : "visible",
                        maxHeight:
                            isScrolled && clientHeight > 0 ? (theme) => `calc(${clientHeight}px - ${theme.spacing(2)})` : clientHeight,
                    }}
                    component={"form"}
                    noValidate
                    autoComplete="off"
                    spacing={2}
                    p={2}
                    direction="column"
                >
                    <SelectFilter2
                        label={t("table.filter.CATEGORY", "Category")}
                        options={values["processCategory"]}
                        value={getFilter("CATEGORY", true)}
                        onChange={setFilter("CATEGORY")}
                    />
                    <SelectFilter2
                        label={t("table.filter.CREATED_BY", "Author")}
                        options={values["createdBy"]}
                        value={getFilter("CREATED_BY", true)}
                        onChange={setFilter("CREATED_BY")}
                    />
                    <Stack direction="column">
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Typography variant="subtitle2">{t("table.filter.other", "Other")}</Typography>
                        </Stack>
                        <FormControlLabel
                            control={<Checkbox checked={getFilter("HIDE_SCENARIOS") !== true} onChange={setScenariosFilter} />}
                            label={`${t("table.filter.SHOW_SCENARIOS", "Show scenarios")}`}
                        />
                        <FormControlLabel
                            control={<Checkbox checked={getFilter("HIDE_FRAGMENTS") !== true} onChange={setFragmentFilter} />}
                            label={`${t("table.filter.SHOW_FRAGMENTS", "Show fragments")}`}
                        />
                        <FormControlLabel
                            control={<Checkbox checked={getFilter("HIDE_ACTIVE") !== true} onChange={setActiveFilter} />}
                            label={`${t("table.filter.SHOW_ACTIVE", "Show active")}`}
                        />
                        <FormControlLabel
                            control={<Checkbox checked={getFilter("SHOW_ARCHIVED") === true} onChange={setArchivedFilter} />}
                            label={`${t("table.filter.SHOW_ARCHIVED", "Show archived")}`}
                        />
                    </Stack>
                </Stack>
            </Fade>
        </div>
    );
}
