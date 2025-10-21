import React from "react";
import { Typography, TextField, Box, Grid } from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Controller, useFormContext } from "react-hook-form";
import type IJobFormState from "@/entities/types/jobTypes";
import dayjs from "dayjs";

//  Only allowing today or future dates

const today = dayjs().startOf("day").toDate(); // sets time to 00:00:00.000

const JobDetails: React.FC = () => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<IJobFormState>();

  return (
    <Box sx={{ border: "1px solid #ddd", p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 400 }}>
        Job Details
      </Typography>

      <Grid container spacing={2}>
        {/*  Job Reference */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="body2">Job Reference:</Typography>
          <TextField
            size="small"
            fullWidth
            {...register("jobReference")}
            error={!!errors.jobReference}
            helperText={errors.jobReference?.message}
          />
        </Grid>

        {/* Job Date */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="body2">
            Job Date: <span style={{ color: "red" }}>*</span>
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Controller
              name="jobDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  value={field.value || null}
                  onChange={(date) => field.onChange(date)}
                  minDate={today}
                  format="MM/dd/yyyy"
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      error: !!errors.jobDate,
                      helperText: errors.jobDate?.message,
                    },
                  }}
                />
              )}
            />
          </LocalizationProvider>
        </Grid>
      </Grid>
    </Box>
  );
};

export default JobDetails;
