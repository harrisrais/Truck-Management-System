import React, { useState, useCallback } from "react";
import Layout from "@/components/appbar/Layout";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { useApolloClient } from "@apollo/client/react";
import { useQuery, useSubscription, useMutation } from "@apollo/client/react";
import { addDays, setHours, setMinutes } from "date-fns";
import { useRouter } from "next/router";
 
// GraphQL Queries & Mutations
import { GET_ALL_VEHICLES } from "@/graphql/query/vehicle.query";
import { GET_JOB_BY_ID } from "@/graphql/query/job.query";
import { UPDATE_JOB_STATUS } from "@/graphql/mutation/job.mutation";
 
// Vehicle Subscriptions
import {
  VEHICLE_CREATED_SUBSCRIPTION,
  VEHICLE_UPDATED_SUBSCRIPTION,
  VEHICLE_DELETED_SUBSCRIPTION,
} from "@/graphql/subscription/vehicle.subscription";
 
// Job Assignment Subscriptions
import {
  JOB_ASSIGNED_SUBSCRIPTION,
  JOB_UNASSIGNED_SUBSCRIPTION,
} from "@/graphql/subscription/allocations.subscription";
 
// Components
import DaySelector from "@/components/pwa/DaySelector";
import VehiclesScreen from "@/components/pwa/VehiclesScreen";
import JobsScreen from "@/components/pwa/JobsScreen";
import CompleteJobScreen from "@/components/pwa/CompleteJobScreen";
import {
  VehicleCreatedData,
  VehicleUpdatedData,
  VehicleDeletedData,
} from "@/entities/types/vehicleTypes";
// --- Types ---
interface Job {
  id: string;
  jobReference?: string | null;
  pickupLocation?: { value: string; label: string } | null;
  deliverLocation?: { value: string; label: string } | null;
  orderQty?: number;
}
 
interface GetAllVehiclesData {
  getAllVehicles: any[];
}
 
interface GetJobByIdResponse {
  job: Job;
}
 
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
 
interface Vehicle {
  id: string;
  identifier: string;
  licencePlate: string;
  make: string;
  assignedJobs: Job[];
}
 
// Utility: Random time within today
const getRandomTimeToday = () => {
  const today = new Date();
  const randomHour = Math.floor(Math.random() * 23);
  const randomMinute = Math.floor(Math.random() * 60);
  return setMinutes(setHours(today, randomHour), randomMinute);
};
 
const PWA: React.FC = () => {
  const router = useRouter();
  const client = useApolloClient();
 
  // --- Day selector setup ---
  const today = new Date();
  const [startIndex, setStartIndex] = useState(0);
  const days = Array.from({ length: 5 }, (_, i) => addDays(today, i));
  const handlePrev = () => {
    if (startIndex > 0) setStartIndex((s) => s - 1);
  };
  const handleNext = () => {
    if (startIndex < days.length - 3) setStartIndex((s) => s + 1);
  };
 
  // --- Vehicle query ---
  const { data, loading, error } =
    useQuery<GetAllVehiclesData>(GET_ALL_VEHICLES);
  const vehicles = data?.getAllVehicles || [];
 
  // --- Job status mutation ---
  const [updateJobStatus] = useMutation(UPDATE_JOB_STATUS);
 
  // --- Screen management ---
  // screens (3): 'vehicles' | 'jobs' | 'completeJob'
  const [screen, setScreen] = useState<"vehicles" | "jobs" | "completeJob">(
    "vehicles"
  );
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
 
  // Helper to extract Job IDs
  const extractId = (entry: any) => {
    if (!entry) return null;
    if (typeof entry === "string") return entry;
    if (entry.$oid) return entry.$oid;
    if (entry.id) return entry.id;
    return null;
  };
 
  // Fetch jobs for a selected vehicle
  const fetchJobsForVehicle = useCallback(
    async (vehicle: any) => {
      const rawAssigned = vehicle?.assignedJobs ?? [];
      const ids = rawAssigned.map(extractId).filter(Boolean) as string[];
 
      if (!ids.length) {
        setJobs([]);
        return;
      }
 
      setJobsLoading(true);
      setJobsError(null);
      try {
        const resolved: Job[] = await Promise.all(
          ids.map(async (id) => {
            const res = await client.query<GetJobByIdResponse>({
              query: GET_JOB_BY_ID,
              variables: { id },
              fetchPolicy: "network-only",
            });
            return res.data?.job ?? { id };
          })
        );
        setJobs(resolved);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setJobsError("Failed to load jobs");
      } finally {
        setJobsLoading(false);
      }
    },
    [client]
  );
 
  // --- Handlers ---
  const handleStartShift = async (vehicle: any) => {
    setSelectedVehicle(vehicle);
    await fetchJobsForVehicle(vehicle);
    setScreen("jobs");
  };
 
  const handleJobSwipeRight = async (job: Job) => {
    try {
      await updateJobStatus({
        variables: { id: job.id, status: "In Progress" },
      });
      setActiveJob(job);
      setScreen("completeJob");
    } catch (err) {
      console.error("Failed to update job status:", err);
    }
  };
 
  const handleCompleteJob = async (job: Job) => {
    try {
      await updateJobStatus({ variables: { id: job.id, status: "complete" } });
      router.push("/jobs");
    } catch (err) {
      console.error("Failed to complete job:", err);
    }
  };
 
  const handleBackToVehicles = () => {
    setScreen("vehicles");
    setSelectedVehicle(null);
    setJobs([]);
  };
 
  const handleBackToJobs = () => setScreen("jobs");
 
  // --- VEHICLE SUBSCRIPTIONS (LIVE UPDATES) ---
  useSubscription<VehicleCreatedData>(VEHICLE_CREATED_SUBSCRIPTION, {
    onData: ({ data }) => {
      const newVehicle = data?.data?.vehicleCreated;
      if (!newVehicle) return;
      client.cache.updateQuery<GetAllVehiclesData>(
        { query: GET_ALL_VEHICLES },
        (existing) => {
          if (!existing) return { getAllVehicles: [newVehicle] };
          if (existing.getAllVehicles.find((v) => v.id === newVehicle.id))
            return existing;
          return { getAllVehicles: [...existing.getAllVehicles, newVehicle] };
        }
      );
    },
  });
 
  useSubscription<VehicleUpdatedData>(VEHICLE_UPDATED_SUBSCRIPTION, {
    onData: ({ data }) => {
      const updated = data?.data?.vehicleUpdated;
      if (!updated) return;
      client.cache.updateQuery<GetAllVehiclesData>(
        { query: GET_ALL_VEHICLES },
        (existing) => {
          if (!existing) return { getAllVehicles: [updated] };
          return {
            getAllVehicles: existing.getAllVehicles.map((v) =>
              v.id === updated.id ? { ...v, ...updated } : v
            ),
          };
        }
      );
    },
  });
 
  useSubscription<VehicleDeletedData>(VEHICLE_DELETED_SUBSCRIPTION, {
    onData: ({ data }) => {
      const deletedId = data?.data?.vehicleDeleted;
      if (!deletedId) return;
      client.cache.updateQuery<GetAllVehiclesData>(
        { query: GET_ALL_VEHICLES },
        (existing) => {
          if (!existing) return { getAllVehicles: [] };
          return {
            getAllVehicles: existing.getAllVehicles.filter(
              (v) => v.id !== deletedId
            ),
          };
        }
      );
    },
  });
 
  // --- JOB ASSIGNMENT SUBSCRIPTIONS ---
  useSubscription<JobAssignedSubData>(JOB_ASSIGNED_SUBSCRIPTION, {
    onData: async ({ data }) => {
      const payload = data?.data?.assignJobToVehicle;
      if (!payload || !selectedVehicle) return;
 
      if (payload.vehicle.id === selectedVehicle.id) {
        try {
          await fetchJobsForVehicle(payload.vehicle);
        } catch (err) {
          console.error("Error refetching jobs after assignment:", err);
        }
      }
    },
  });
 
  useSubscription<JobUnassignedSubData>(JOB_UNASSIGNED_SUBSCRIPTION, {
    onData: async ({ data }) => {
      const payload = data?.data?.unassignJobFromVehicle;
      if (!payload || !selectedVehicle) return;
 
      if (payload.vehicle.id === selectedVehicle.id) {
        try {
          await fetchJobsForVehicle(payload.vehicle);
        } catch (err) {
          console.error("Error refetching jobs after unassignment:", err);
        }
      }
    },
  });
 
  // --- Rendering logic ---
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error fetching vehicles</p>;
 
  if (screen === "jobs") {
    return (
      <Layout>
        <JobsScreen
          selectedVehicle={selectedVehicle}
          jobs={jobs}
          jobsLoading={jobsLoading}
          jobsError={jobsError}
          onBack={handleBackToVehicles}
          onSwipeRight={handleJobSwipeRight}
        />
      </Layout>
    );
  }
 
  if (screen === "completeJob" && activeJob) {
    return (
      <Layout>
        <CompleteJobScreen
          activeJob={activeJob}
          onBack={handleBackToJobs}
          onCompleteJob={handleCompleteJob}
        />
      </Layout>
    );
  }
 
  // Default: Vehicles screen
  return (
    <Layout>
      <DaySelector
        days={days}
        startIndex={startIndex}
        today={today}
        onPrev={handlePrev}
        onNext={handleNext}
      />
      <VehiclesScreen
        vehicles={vehicles}
        onStartShift={handleStartShift}
        getRandomTimeToday={getRandomTimeToday}
      />
    </Layout>
  );
};
 
export default PWA;
export const getServerSideProps = withPageAuthRequired();