import {
    Box,
    Checkbox,
    Chip,
    FilledInput,
    FormControl,
    FormControlLabel,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Stack,
    Typography,
} from "@mui/material";
import { random } from "lodash";
import React, { useMemo } from "react";
import { Truncate } from "./cellRenderers/truncate";
import ClearIcon from "@mui/icons-material/Clear";
import { FilterListOff } from "@mui/icons-material";
import { IconImg } from "./cellRenderers/iconImg";

export interface SelectFilterProps<T = string> {
    label: string;
    options: T[];
    value: string[];
    onChange: (value: string[]) => void;
}

export function SelectFilter2(props: SelectFilterProps): JSX.Element {
    const { options, value, onChange, label } = props;
    return (
        <Stack direction="column">
            <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2">{label}</Typography>
                <IconButton
                    aria-label="clear"
                    onClick={() => onChange(null)}
                    edge="end"
                    size="small"
                    sx={{ visibility: value.length ? "visible" : "hidden" }}
                >
                    <FilterListOff />
                </IconButton>
            </Stack>
            {options?.map((option) => {
                const isSelected = value.includes(option);
                const onClick = () => onChange(isSelected ? value.filter((v) => v !== option) : [...value, option]);
                return <FormControlLabel key={option} control={<Checkbox checked={isSelected} onChange={onClick} />} label={option} />;
            })}
        </Stack>
    );
}
export function SelectFilter3(props: SelectFilterProps<{ name: string; icon: string }>): JSX.Element {
    const { options, value, onChange, label } = props;
    return (
        <Stack direction="column">
            <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2">{label}</Typography>
                <IconButton
                    aria-label="clear"
                    onClick={() => onChange(null)}
                    edge="end"
                    size="small"
                    sx={{ visibility: value.length ? "visible" : "hidden" }}
                >
                    <FilterListOff />
                </IconButton>
            </Stack>

            {options?.map(({ name: option, icon }) => {
                const isSelected = value.includes(option);
                const onClick = () => onChange(isSelected ? value.filter((v) => v !== option) : [...value, option]);
                return (
                    <>
                        <FormControlLabel
                            key={option}
                            control={<Checkbox checked={isSelected} onChange={onClick} />}
                            label={
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <span>{option}</span>
                                    <IconImg src={icon} style={{ height: "1.2em" }} />
                                </Stack>
                            }
                        />
                    </>
                );
            })}
        </Stack>
    );
}

export function SelectFilter(props: SelectFilterProps): JSX.Element {
    const { value = [], label, options, onChange } = props;

    const visibleOptions = useMemo(() => options || [], [options]);
    const labelId = useMemo(() => `label-${random(100000)}`, []);
    return (
        <FormControl fullWidth variant="filled">
            <InputLabel id={labelId}>{label}</InputLabel>
            <Select<string[]>
                labelId={labelId}
                value={value}
                label={label}
                onChange={(e: SelectChangeEvent<string[]>) => onChange([].concat(e.target.value))}
                multiple
                input={<FilledInput />}
                renderValue={(selected) => (
                    <Box
                        component={Truncate}
                        renderTruncator={({ hiddenItemsCount }) => <>...</>}
                        sx={{ display: "flex", columnGap: 0.5, rowGap: 1 }}
                    >
                        {selected.map((v) => (
                            <Chip
                                key={v}
                                label={v}
                                size="small"
                                onPointerDown={(event) => {
                                    //select is taking over all events
                                    event.preventDefault();
                                }}
                                onDelete={() => {
                                    onChange(value.filter((c) => c !== v));
                                }}
                                onDoubleClick={() => {
                                    onChange([v]);
                                }}
                            />
                        ))}
                    </Box>
                )}
            >
                {visibleOptions.map((name) => (
                    <MenuItem key={name} value={name}>
                        {name}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}
