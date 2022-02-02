import { Box, Container, Stack, useMediaQuery, useTheme } from "@mui/material";
import React, { PropsWithChildren } from "react";

export function View({ children, inTab }: PropsWithChildren<{ inTab?: boolean }>): JSX.Element {
    const theme = useTheme();
    const md = useMediaQuery(theme.breakpoints.up("md"));

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "row",
                minHeight: inTab ? "100%" : "100vh",
                maxHeight: inTab ? "100%" : "100vh",
                minWidth: inTab ? "100%" : "100vw",
                maxWidth: inTab ? "100%" : "100vw",
            }}
        >
            <Box
                // display="flex" // needed for components view
                flex={1}
                sx={{ overflow: "hidden", overflowY: "auto" }}
            >
                <Container maxWidth="xl" disableGutters={!md}>
                    <Stack direction="column" justifyContent="center" height="100%" spacing={2} p={md ? 2 : 0.5}>
                        {children}
                    </Stack>
                </Container>
            </Box>
        </Box>
    );
}
