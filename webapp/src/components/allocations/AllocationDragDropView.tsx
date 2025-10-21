import Head from "next/head";
import { Box, CircularProgress, Typography, useTheme } from "@mui/material";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import Layout from "@/components/appbar/Layout";
import { DropResult } from "react-beautiful-dnd";
import { useQuery, useMutation, useSubscription } from "@apollo/client/react";
import {
  GET_ALLOCATION_DATA,
  ASSIGN_JOB_TO_VEHICLE,
  UNASSIGN_JOB_FROM_VEHICLE,
} from "@/graphql/query/allocations.query";
import {
  JOB_ASSIGNED_SUBSCRIPTION,
  JOB_UNASSIGNED_SUBSCRIPTION,
} from "@/graphql/subscription/allocations.subscription";
import {
  VEHICLE_CREATED_SUBSCRIPTION,
  VEHICLE_UPDATED_SUBSCRIPTION,
  VEHICLE_DELETED_SUBSCRIPTION,
} from "@/graphql/subscription/vehicle.subscription";
import {
  JOB_CREATED,
  JOB_UPDATED,
  JOB_DELETED,
} from "@/graphql/subscription/job.subscription";
import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
// --- Import New Components ---
import AllocationHeader from "@/components/allocations/AllocationHeader";
import AllocationDragDropView from "@/components/allocations/AllocationDragDropView";

// ----------------- Types (Keep in page file for central data logic) -----------------
interface Job {
  id: string;
  jobReference: string;
  pickupFrom: string;
  deliverTo: string;
}

interface Vehicle {
  id: string;
  identifier: string;
  licencePlate: string;
  make: string;
  assignedJobs: Job[];
}

interface AllocationData {
  getAllVehicles: Vehicle[];
  jobs: Job[];
}

// ... (Keep all other subscription and utility types here) ...
interface JobAssignmentPayload {
  vehicle: Vehicle;
  job: Job;
}
interface JobAssignedSubData {
  assignJobToVehicle: JobAssignmentPayload;
}
interface JobUnassignedSubData {
  unassignJobFromVehicle: JobAssignmentPayload;
}
interface VehicleCreatedData {
  vehicleCreated: Vehicle;
}
interface VehicleUpdatedData {
  vehicleUpdated: Vehicle;
}
interface VehicleDeletedData {
  vehicleDeleted: string;
}
interface JobCreatedData {
  jobCreated: Job;
}
interface JobUpdatedData {
  jobUpdated: Job;
}
interface JobDeletedData {
  jobDeleted: string;
}

function Allocations() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  // --- Apollo Hooks ---
  const { loading, error, data, client } =
    useQuery<AllocationData>(GET_ALLOCATION_DATA);

  const [assignJob] = useMutation(ASSIGN_JOB_TO_VEHICLE);
  const [unassignJob] = useMutation(UNASSIGN_JOB_FROM_VEHICLE);

  // --- Local State ---
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [selectedShift, setSelectedShift] = useState("");

  // Create theme-aware scrollbar styles
  const thinScrollbarStyles = {
    // WebKit browsers (Chrome, Safari, Edge)
    "&::-webkit-scrollbar": {
      width: "4px",
      height: "4px",
    },
    "&::-webkit-scrollbar-track": {
      background: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
      borderRadius: "2px",
    },
    "&::-webkit-scrollbar-thumb": {
      background: isDarkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)",
      borderRadius: "2px",
      "&:hover": {
        background: isDarkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
      },
    },
    "&::-webkit-scrollbar-corner": {
      background: "transparent",
    },
    // Firefox
    scrollbarWidth: "thin",
    scrollbarColor: isDarkMode
      ? "rgba(255,255,255,0.3) rgba(255,255,255,0.1)"
      : "rgba(0,0,0,0.3) rgba(0,0,0,0.1)",
  };

  // --- Subscriptions (All kept here for central cache management) ---
  // ... (All useSubscription blocks remain in this file) ...
  useSubscription<JobAssignedSubData>(JOB_ASSIGNED_SUBSCRIPTION, {
    onData: ({ data }) => {
      const payload = data?.data?.assignJobToVehicle;
      if (!payload) return;
      client.cache.updateQuery<AllocationData>(
        { query: GET_ALLOCATION_DATA },
        (existing) => {
          if (!existing) return existing;
          return {
            ...existing,
            getAllVehicles: existing.getAllVehicles.map((v) =>
              v.id === payload.vehicle.id ? payload.vehicle : v
            ),
            jobs: existing.jobs,
          };
        }
      );
    },
  });

  useSubscription<JobUnassignedSubData>(JOB_UNASSIGNED_SUBSCRIPTION, {
    onData: ({ data }) => {
      const payload = data?.data?.unassignJobFromVehicle;
      if (!payload) return;
      client.cache.updateQuery<AllocationData>(
        { query: GET_ALLOCATION_DATA },
        (existing) => {
          if (!existing) return existing;
          return {
            ...existing,
            getAllVehicles: existing.getAllVehicles.map((v) =>
              v.id === payload.vehicle.id ? payload.vehicle : v
            ),
            jobs: existing.jobs,
          };
        }
      );
    },
  });

  useSubscription<VehicleCreatedData>(VEHICLE_CREATED_SUBSCRIPTION, {
    onData: ({ data }) => {
      const newVehicle = data?.data?.vehicleCreated;
      if (!newVehicle) return;
      client.cache.updateQuery<AllocationData>(
        { query: GET_ALLOCATION_DATA },
        (existing) => {
          if (!existing) return { getAllVehicles: [newVehicle], jobs: [] };
          if (existing.getAllVehicles.find((v) => v.id === newVehicle.id)) {
            return existing;
          }
          return {
            ...existing,
            getAllVehicles: [...existing.getAllVehicles, newVehicle],
          };
        }
      );
    },
  });

  useSubscription<VehicleUpdatedData>(VEHICLE_UPDATED_SUBSCRIPTION, {
    onData: ({ data }) => {
      const updatedVehicle = data?.data?.vehicleUpdated;
      if (!updatedVehicle) return;
      client.cache.updateQuery<AllocationData>(
        { query: GET_ALLOCATION_DATA },
        (existing) => {
          if (!existing) return existing;
          return {
            ...existing,
            getAllVehicles: existing.getAllVehicles.map((v) =>
              v.id === updatedVehicle.id ? { ...v, ...updatedVehicle } : v
            ),
          };
        }
      );
    },
  });

  useSubscription<VehicleDeletedData>(VEHICLE_DELETED_SUBSCRIPTION, {
    onData: ({ data }) => {
      const deletedVehicleId = data?.data?.vehicleDeleted;
      if (!deletedVehicleId) return;
      client.cache.updateQuery<AllocationData>(
        { query: GET_ALLOCATION_DATA },
        (existing) => {
          if (!existing) return existing;
          return {
            ...existing,
            getAllVehicles: existing.getAllVehicles.filter(
              (v) => v.id !== deletedVehicleId
            ),
          };
        }
      );
    },
  });

  useSubscription<JobCreatedData>(JOB_CREATED, {
    onData: ({ data }) => {
      const newJob = data?.data?.jobCreated;
      if (!newJob) return;
      client.cache.updateQuery<AllocationData>(
        { query: GET_ALLOCATION_DATA },
        (existing) => {
          if (!existing) return { getAllVehicles: [], jobs: [newJob] };
          if (existing.jobs.find((j) => j.id === newJob.id)) {
            return existing;
          }
          return {
            ...existing,
            jobs: [...existing.jobs, newJob],
          };
        }
      );
    },
  });

  useSubscription<JobUpdatedData>(JOB_UPDATED, {
    onData: ({ data }) => {
      const updatedJob = data?.data?.jobUpdated;
      if (!updatedJob) return;
      client.cache.updateQuery<AllocationData>(
        { query: GET_ALLOCATION_DATA },
        (existing) => {
          if (!existing) return existing;
          return {
            ...existing,
            jobs: existing.jobs.map((j) =>
              j.id === updatedJob.id ? { ...j, ...updatedJob } : j
            ),
          };
        }
      );
    },
  });

  useSubscription<JobDeletedData>(JOB_DELETED, {
    onData: ({ data }) => {
      const deletedJobId = data?.data?.jobDeleted;
      if (!deletedJobId) return;
      client.cache.updateQuery<AllocationData>(
        { query: GET_ALLOCATION_DATA },
        (existing) => {
          if (!existing) return existing;
          return {
            ...existing,
            jobs: existing.jobs.filter((j) => j.id !== deletedJobId),
            getAllVehicles: existing.getAllVehicles.map((v) => ({
              ...v,
              assignedJobs: v.assignedJobs.filter((j) => j.id !== deletedJobId),
            })),
          };
        }
      );
    },
  });

  // --- Loading/Error States ---
  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: "flex", justifyContent: "center", pt: 30 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Box sx={{ p: 4 }}>
          <Typography color="error">Error: {error.message}</Typography>
        </Box>
      </Layout>
    );
  }

  // --- Data Processing ---
  const allVehicles = data?.getAllVehicles || [];
  const allJobs = data?.jobs || [];

  const assignedJobIds = new Set(
    allVehicles.flatMap((v) => v.assignedJobs.map((j) => j.id))
  );
  const unassignedJobs = allJobs.filter((j) => !assignedJobIds.has(j.id));

  // --- Drag and Drop Handler (Must stay here as it uses mutations) ---
  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const sourceId = source.droppableId;
    const destinationId = destination.droppableId;
    const jobId = draggableId;

    if (sourceId === "unassigned-jobs" && destinationId !== "unassigned-jobs") {
      assignJob({ variables: { vehicleId: destinationId, jobId } });
    } else if (
      sourceId !== "unassigned-jobs" &&
      destinationId === "unassigned-jobs"
    ) {
      unassignJob({ variables: { vehicleId: sourceId, jobId } });
    } else if (
      sourceId !== "unassigned-jobs" &&
      destinationId !== "unassigned-jobs" &&
      sourceId !== destinationId
    ) {
      unassignJob({ variables: { vehicleId: sourceId, jobId } });
      assignJob({ variables: { vehicleId: destinationId, jobId } });
    }
  };

  // --- Render ---
  return (
    <Layout>
      <Head>
        <title>Allocations</title>
        <meta
          name="description"
          content="This page allows users to allocate jobs to vehicles"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Box
        sx={{
          p: 2,
          height: "100vh",
          overflow: "hidden",
          backgroundColor: theme.palette.background.default,
        }}
      >
        {/* Component 1: Header Section with Filters and Icons */}
        <AllocationHeader
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedShift={selectedShift}
          setSelectedShift={setSelectedShift}
        />

        {/* Component 2: Main Drag and Drop View */}
        <AllocationDragDropView
          allVehicles={allVehicles}
          unassignedJobs={unassignedJobs}
          onDragEnd={onDragEnd}
          thinScrollbarStyles={thinScrollbarStyles}
        />
      </Box>
    </Layout>
  );
}

export default Allocations;

export const getServerSideProps = withPageAuthRequired();