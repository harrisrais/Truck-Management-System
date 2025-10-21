import React from "react";
import { Grid, Box, Typography } from "@mui/material";
import { useFormContext, useWatch } from "react-hook-form";
import type IJobFormState from "@/entities/types/jobTypes";
import SelectField from "./SelectField";
import { contacts } from "@/utils/jobConstants";
import {
  getLocationsForContact,
  useAutoSelectLocation,
} from "@/hooks/useAutoSelectLocation";

const JobRoute: React.FC = () => {
  const { control } = useFormContext<IJobFormState>();

  const pickupFrom = useWatch({ name: "pickupFrom", control });
  const deliverTo = useWatch({ name: "deliverTo", control });

  useAutoSelectLocation("pickupFrom", "pickupLocation");
  useAutoSelectLocation("deliverTo", "deliverLocation");

  return (
    <Box sx={{ border: "1px solid #ddd", p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 400 }}>
        Job Route
      </Typography>

      <Grid container spacing={2}>
        {/*  Billable  */}
        <Grid size={{ xs: 12 }}>
          <SelectField
            name="billable"
            label="Billable:"
            options={contacts}
            required
            sx={{ width: { xs: "100%", sm: "49%" } }}
          />
        </Grid>

        {/*  Pickup From  */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <SelectField
            name="pickupFrom"
            label="Pickup From:"
            required
            options={contacts}
          />
        </Grid>

        {/*  Pickup Location  */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <SelectField
            name="pickupLocation"
            label="Pickup Location:"
            required
            disabled={!pickupFrom}
            disableClear
            returnObject
            options={pickupFrom ? getLocationsForContact(pickupFrom) : []}
          />
        </Grid>

        {/* Deliver To  */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <SelectField
            name="deliverTo"
            label="Deliver To:"
            required
            options={contacts}
          />
        </Grid>

        {/*  Deliver Location  */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <SelectField
            name="deliverLocation"
            label="Deliver Location:"
            required
            disabled={!deliverTo}
            disableClear
            returnObject
            options={deliverTo ? getLocationsForContact(deliverTo) : []}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default JobRoute;
