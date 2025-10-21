import React from "react";
import { Typography, TextField, Box, Grid } from "@mui/material";
import { useFormContext } from "react-hook-form";

const DuplicateJobs: React.FC = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <Box sx={{ border: "1px solid #ddd", p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 400 }}>
        Duplicate Jobs
      </Typography>

      <Typography variant="body2">No of Jobs:</Typography>

      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12 }}>
          <TextField
            type="number"
            fullWidth
            size="small"
            defaultValue={1}
            error={!!errors.duplicateCount}
            helperText={
              typeof errors.duplicateCount?.message === "string"
                ? errors.duplicateCount.message
                : ""
            }
            {...register("duplicateCount")}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DuplicateJobs;
