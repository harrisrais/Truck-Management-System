import React from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";

interface JobsTopBarProps {
  onBack: () => void;
}

const JobsTopBar: React.FC<JobsTopBarProps> = ({ onBack }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 2,
      justifyContent: "center",
      position: "relative",
      mb: 3,
    }}
  >
    <IconButton
      onClick={onBack}
      sx={{ position: "absolute", left: 8, top: -8, color: "white" }}
      size="large"
    >
      <ArrowBack />
    </IconButton>
    <Typography variant="body1" color="white">
      Swipe job to start
    </Typography>
  </Box>
);

export default JobsTopBar;