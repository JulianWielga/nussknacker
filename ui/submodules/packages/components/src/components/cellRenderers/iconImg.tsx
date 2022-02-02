import { useTheme } from "@mui/material";
import React, { DetailedHTMLProps, ImgHTMLAttributes, useContext } from "react";
import { NkIconsContext } from "../../settings/nkApiProvider";

type Props = DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>

export function IconImg({ src, ...props }: Props): JSX.Element {
    const { palette } = useTheme();
    const { getComponentIconSrc } = useContext(NkIconsContext);

    return (
        <img
            style={{
                height: "1.5rem",
                verticalAlign: "middle",
                filter: palette.mode === "light" ? "invert(1)" : null,
            }}
            src={getComponentIconSrc(src)}
            {...props}
        />
    );
}
