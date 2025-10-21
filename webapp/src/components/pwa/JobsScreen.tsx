import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import JobsTopBar from "./JobsTopBar";
import JobCard from "./JobCard";

interface Job {
  id: string;
  jobReference?: string | null;
  pickupLocation?: { value: string; label: string } | null;
  deliverLocation?: { value: string; label: string } | null;
  orderQty?: number;
}

interface JobsScreenProps {
  selectedVehicle: any;
  jobs: Job[];
  jobsLoading: boolean;
  jobsError: string | null;
  onBack: () => void;
  onSwipeRight: (job: Job) => void;
}

const JobsScreen: React.FC<JobsScreenProps> = ({
  selectedVehicle,
  jobs,
  jobsLoading,
  jobsError,
  onBack,
  onSwipeRight,
}) => {
  return (
    <Box sx={{ backgroundColor: "#00263A", minHeight: "100vh", p: 3 }}>
      <JobsTopBar onBack={onBack} />

      <Box sx={{ maxWidth: 1200, margin: "0 auto" }}>
        <Typography color="white" sx={{ mb: 2 }}>
          Vehicle: {selectedVehicle?.identifier ?? "Unknown vehicle"}
        </Typography>

        {jobsLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : jobsError ? (
          <Typography color="error">{jobsError}</Typography>
        ) : jobs.length === 0 ? (
          <Typography color="white">
            No assigned jobs for this vehicle.
          </Typography>
        ) : (
          jobs.map((job) => (
            <JobCard key={job.id} job={job} onSwipeRight={onSwipeRight} />
          ))
        )}
      </Box>
    </Box>
  );
};

export default JobsScreen;