import React from "react";
import { Container, Typography, Box, createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import TaskList from "./components/TaskList";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    background: {
      default: "#f5f5f5",
    },
  },
});

const App: React.FC = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ textAlign: "center", color: "primary.main" }}>
          Task Manager
        </Typography>
        <TaskList />
      </Box>
    </Container>
  </ThemeProvider>
);

export default App;