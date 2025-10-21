import Head from "next/head";
import {
  Box,
  CircularProgress,
  Typography,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import PauseIcon from "@mui/icons-material/Pause";
import RefreshIcon from "@mui/icons-material/Refresh";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import Layout from "@/components/appbar/Layout";
import { useSnackbar } from "@/contexts/SnackbarContext";
// ----------------- dnd-kit imports -----------------
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragEndEvent,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useQuery, useMutation, useSubscription } from "@apollo/client/react";
import VehicleCard from "@/components/vehicles/VehicleCard";
import JobCard from "@/components/jobs/JobCard";
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
import { vehicleColors } from "@/utils/allocationsUtils";
import { useState, useEffect } from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { createPortal } from "react-dom";

// ----------------- Types -----------------
interface Job {
  id: string;
  jobReference: string;
  pickupFrom: string;
  deliverTo: string;
  pickupLocation?: { value: string; label: string };
  deliverLocation?: { value: string; label: string };
  jobStatus?: string;
}

interface Vehicle {
  id: string;
  identifier: string;
  licencePlate: string;
  make: string;
  vehicleClass?: string;
  assignedJobs: Job[];
  registrationExpiry?: string;
}

interface AllocationData {
  getAllVehicles: Vehicle[];
  jobs: Job[];
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

// ----------------- Draggable Job Card Component -----------------
interface DragHandleWrapperProps {
  job: Job;
  containerId: string;
  isDraggingOverlay: boolean;
}

function DragHandleWrapper({ job, containerId, isDraggingOverlay }: DragHandleWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: job.id,
    data: { job, containerId },
    disabled: job.jobStatus === "In Progress" || job.jobStatus === "Complete" || job.jobStatus === "complete",
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
  } : undefined;

  const isDisabled = job.jobStatus === "In Progress" || job.jobStatus === "Complete" || job.jobStatus === "complete";
  const finalStyle = isDraggingOverlay ? {} : style;

  return (
    <Box
      ref={setNodeRef}
      style={finalStyle}
      {...attributes}
      {...listeners}
      sx={{
        minWidth: containerId === "unassigned-jobs" ? "170px" : "180px",
        width: containerId === "unassigned-jobs" ? "calc(50% - 8px)" : "180px",
        flexShrink: 0,
        opacity: isDisabled && !isDraggingOverlay ? 0.6 : 1,
        visibility: isDragging && !isDraggingOverlay ? 'hidden' : 'visible',
      }}
    >
      <JobCard job={job} isDragging={isDraggingOverlay} />
    </Box>
  );
}

interface DroppableJobContainerProps {
  id: string;
  jobs: Job[];
  isVehicleContainer: boolean;
  vehicleColor?: string;
}

function DroppableJobContainer({ id, jobs, isVehicleContainer, vehicleColor }: DroppableJobContainerProps) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const { isOver, setNodeRef } = useDroppable({
    id: id,
    data: {
      accepts: ['job'], 
      jobs,
    }
  });

  const thinScrollbarStyles = {
    '&::-webkit-scrollbar': {
      width: '6px',
      height: '6px', 
    },
    '&::-webkit-scrollbar-track': {
      background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
      borderRadius: '3px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
      borderRadius: '3px',
      '&:hover': {
        background: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
      },
    },
    scrollbarWidth: 'thin',
    scrollbarColor: isDarkMode
      ? 'rgba(255,255,255,0.2) rgba(255,255,255,0.05)'
      : 'rgba(0,0,0,0.2) rgba(0,0,0,0.05)',
  };

  const containerSx = isVehicleContainer
    ? {
      display: "flex",
      gap: 1.5,
      minHeight: "200px", 
      maxHeight: "200px", 
      overflowX: "auto",
      overflowY: "hidden",
      ...thinScrollbarStyles,
    }
    : {
      display: "flex",
      flexWrap: "wrap",
      gap: 1.5,
      minHeight: "100%",
      p: 1,
      alignContent: "flex-start",
    };

  return (
    <Box
      ref={setNodeRef}
      sx={{
        ...containerSx,
        backgroundColor: isOver
          ? theme.palette.action.hover
          : "transparent",
        border: isOver
          ? `2px dashed ${theme.palette.primary.main}`
          : isVehicleContainer ? "2px dashed transparent" : "none", 
        borderRadius: 1,
      }}
    >
      {jobs.length > 0 ? (
        <SortableContext
          items={jobs.map(job => job.id)}
          strategy={isVehicleContainer ? horizontalListSortingStrategy : rectSortingStrategy}
        >
          {jobs.map((job) => (
            <DragHandleWrapper
              key={job.id}
              job={job}
              containerId={id}
              isDraggingOverlay={false}
            />
          ))}
        </SortableContext>
      ) : (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            minWidth: isVehicleContainer ? "200px" : "100%",
          }}
        >
        </Box>
      )}
    </Box>
  );
}

// ----------------- Main Allocations Component -----------------
function Allocations() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));

  const { loading, error, data, client } = useQuery<AllocationData>(GET_ALLOCATION_DATA, {
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: false,
  });

  const [assignJob] = useMutation(ASSIGN_JOB_TO_VEHICLE, {
    refetchQueries: [],
    awaitRefetchQueries: false,
  });

  const [unassignJob] = useMutation(UNASSIGN_JOB_FROM_VEHICLE, {
    refetchQueries: [],
    awaitRefetchQueries: false,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [selectedShift, setSelectedShift] = useState("");
  const [open, setOpen] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null); 

  const { showSnackbar } = useSnackbar();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: ({ currentCoordinates }) => currentCoordinates,
    })
  );

  const thinScrollbarStyles = {
    '&::-webkit-scrollbar': {
      width: '6px',
      height: '6px',
    },
    '&::-webkit-scrollbar-track': {
      background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
      borderRadius: '3px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
      borderRadius: '3px',
      '&:hover': {
        background: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
      },
    },
    scrollbarWidth: 'thin',
    scrollbarColor: isDarkMode
      ? 'rgba(255,255,255,0.2) rgba(255,255,255,0.05)'
      : 'rgba(0,0,0,0.2) rgba(0,0,0,0.05)',
  };

  const filterExpiredVehiclesAndJobs = (allocationData: AllocationData) => {
    const currentDate = dayjs();
    
    const validVehicles = allocationData.getAllVehicles.filter(vehicle => {
      if (!vehicle.registrationExpiry) return true;
      const expiryDate = dayjs(vehicle.registrationExpiry);
      return !expiryDate.isBefore(currentDate, 'day');
    });

    const validVehicleIds = new Set(validVehicles.map(v => v.id));
    
    const jobsAssignedToExpiredVehicles = new Set();
    allocationData.getAllVehicles.forEach(vehicle => {
      if (!validVehicleIds.has(vehicle.id)) {
        vehicle.assignedJobs.forEach(job => {
          jobsAssignedToExpiredVehicles.add(job.id);
        });
      }
    });

    const validJobs = allocationData.jobs.filter(job => !jobsAssignedToExpiredVehicles.has(job.id));

    return {
      getAllVehicles: validVehicles,
      jobs: validJobs
    };
  };

  const filteredData = data ? filterExpiredVehiclesAndJobs(data) : null;

  const allVehicles = filteredData?.getAllVehicles || [];
  const allJobs = filteredData?.jobs || [];

  // ----------------- Subscriptions -----------------
  useSubscription<JobAssignedSubData>(JOB_ASSIGNED_SUBSCRIPTION, {
    onData: ({ data }) => {
      const payload = data?.data?.assignJobToVehicle;
      if (!payload) return;
      
      if (payload.vehicle.registrationExpiry && 
          dayjs(payload.vehicle.registrationExpiry).isBefore(dayjs(), 'day')) {
        return;
      }
      
      client.cache.updateQuery<AllocationData>(
        { query: GET_ALLOCATION_DATA },
        (existing) => {
          if (!existing) return existing;
          return {
            ...existing,
            getAllVehicles: existing.getAllVehicles.map((v) =>
              v.id === payload.vehicle.id ? payload.vehicle : v
            ),
          };
        }
      );
    },
    shouldResubscribe: true,
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
          };
        }
      );
    },
    shouldResubscribe: true,
  });

  useSubscription<VehicleCreatedData>(VEHICLE_CREATED_SUBSCRIPTION, {
    onData: ({ data }) => {
      const newVehicle = data?.data?.vehicleCreated;
      if (!newVehicle) return;
      
      if (newVehicle.registrationExpiry && 
          dayjs(newVehicle.registrationExpiry).isBefore(dayjs(), 'day')) {
        return;
      }
      
      client.cache.updateQuery<AllocationData>(
        { query: GET_ALLOCATION_DATA },
        (existing) => {
          if (!existing) return { getAllVehicles: [newVehicle], jobs: [] };
          if (existing.getAllVehicles.find((v) => v.id === newVehicle.id)) return existing;
          return {
            ...existing,
            getAllVehicles: [...existing.getAllVehicles, newVehicle],
          };
        }
      );
    },
    shouldResubscribe: true,
  });

  useSubscription<VehicleUpdatedData>(VEHICLE_UPDATED_SUBSCRIPTION, {
    onData: ({ data }) => {
      const updatedVehicle = data?.data?.vehicleUpdated;
      if (!updatedVehicle) return;
      
      if (updatedVehicle.registrationExpiry && 
          dayjs(updatedVehicle.registrationExpiry).isBefore(dayjs(), 'day')) {
        client.cache.updateQuery<AllocationData>(
          { query: GET_ALLOCATION_DATA },
          (existing) => {
            if (!existing) return existing;
            return {
              ...existing,
              getAllVehicles: existing.getAllVehicles.filter((v) => v.id !== updatedVehicle.id),
            };
          }
        );
        return;
      }
      
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
    shouldResubscribe: true,
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
            getAllVehicles: existing.getAllVehicles.filter((v) => v.id !== deletedVehicleId),
          };
        }
      );
    },
    shouldResubscribe: true,
  });

  useSubscription<JobCreatedData>(JOB_CREATED, {
    onData: ({ data }) => {
      const newJob = data?.data?.jobCreated;
      if (!newJob) return;
      client.cache.updateQuery<AllocationData>(
        { query: GET_ALLOCATION_DATA },
        (existing) => {
          if (!existing) return { getAllVehicles: [], jobs: [newJob] };
          if (existing.jobs.find((j) => j.id === newJob.id)) return existing;
          return {
            ...existing,
            jobs: [...existing.jobs, newJob],
          };
        }
      );
    },
    shouldResubscribe: true,
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
            getAllVehicles: existing.getAllVehicles.map((v) => ({
              ...v,
              assignedJobs: v.assignedJobs.map((j) =>
                j.id === updatedJob.id ? { ...j, ...updatedJob } : j
              ),
            })),
          };
        }
      );
    },
    shouldResubscribe: true,
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
    shouldResubscribe: true,
  });

  // Only show initial loading state
  if (loading && !data) {
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

  const assignedJobIds = new Set(allVehicles.flatMap((v) => v.assignedJobs.map((j) => j.id)));
  const unassignedJobs = allJobs.filter((j) => !assignedJobIds.has(j.id));
  const activeJob = allJobs.find(job => job.id === activeJobId) ||
    allVehicles.flatMap((v) => v.assignedJobs).find((job) => job.id === activeJobId);

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveJobId(null);
    const { active, over } = event;
    const jobId = active.id.toString();
    const sourceData = active.data.current as { job: Job, containerId: string };
    const sourceId = sourceData.containerId;
    const destinationId = over?.id?.toString() || null;

    if (!destinationId || sourceId === destinationId) return;

    const draggedJob = sourceData.job;

    if (draggedJob.jobStatus === "In Progress" || draggedJob.jobStatus === "Complete" || draggedJob.jobStatus === "complete") {
      showSnackbar(
        `This job is ${draggedJob.jobStatus.toLowerCase()} and cannot be reassigned.`,
        "warning"
      );
      return;
    }

    if (isProcessing) return;

    try {
      setIsProcessing(true);

      if (sourceId === "unassigned-jobs" && destinationId !== "unassigned-jobs") {
        await assignJob({ variables: { vehicleId: destinationId, jobId } });
        showSnackbar("Job successfully assigned.", "success");
      } else if (sourceId !== "unassigned-jobs" && destinationId === "unassigned-jobs") {
        await unassignJob({ variables: { vehicleId: sourceId, jobId } });
        showSnackbar("Job successfully unassigned.", "info");
      } else if (
        sourceId !== "unassigned-jobs" &&
        destinationId !== "unassigned-jobs" &&
        sourceId !== destinationId
      ) {
        // Optimistically update the cache before the mutations
        client.cache.updateQuery<AllocationData>(
          { query: GET_ALLOCATION_DATA },
          (existing) => {
            if (!existing) return existing;
            
            const updatedVehicles = existing.getAllVehicles.map((v) => {
              if (v.id === sourceId) {
                return {
                  ...v,
                  assignedJobs: v.assignedJobs.filter((j) => j.id !== jobId),
                };
              }
              if (v.id === destinationId) {
                return {
                  ...v,
                  assignedJobs: [...v.assignedJobs, draggedJob],
                };
              }
              return v;
            });
            
            return {
              ...existing,
              getAllVehicles: updatedVehicles,
            };
          }
        );

        // Perform mutations in parallel
        await Promise.all([
          unassignJob({ variables: { vehicleId: sourceId, jobId } }),
          assignJob({ variables: { vehicleId: destinationId, jobId } })
        ]);
        
        showSnackbar("Job successfully moved to another vehicle.", "success");
      }
    } catch (error) {
      console.error("Error processing job assignment:", error);
      showSnackbar("An error occurred while processing job assignment.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragStart = (event: any) => {
    setActiveJobId(event.active.id.toString());
  };

  const handleDragCancel = () => {
    setActiveJobId(null);
  };

  return (
    <Layout>
      <Head>
        <title>Allocations</title>
        <meta name="description" content="This page allows users to allocate jobs to vehicles" />
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
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            pl: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            pb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                open={open}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
                value={selectedDate}
                format="MM/DD/YYYY"
                onChange={(newValue) => setSelectedDate(newValue)}
                slotProps={{
                  textField: {
                    size: "small",
                    onKeyDown: (e) => e.preventDefault(),
                    onClick: () => setOpen(true),
                    InputProps: { readOnly: true, sx: { cursor: "pointer" } },
                    sx: { width: "200px" },
                  },
                  actionBar: { actions: ["clear", "today"] },
                }}
              />
            </LocalizationProvider>
            <FormControl size="small" sx={{ width: "200px" }}>
              <Select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
                displayEmpty
              >
                <MenuItem value="">
                  <Typography color="text.secondary">Select Shift</Typography>
                </MenuItem>
                <MenuItem value="Shift A">Shift A</MenuItem>
                <MenuItem value="Shift B">Shift B</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: "flex", gap: 1, pr: 2 }}>
            {[SearchIcon, FilterListIcon, PauseIcon, RefreshIcon].map((Icon, idx) => (
              <IconButton
                key={idx}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  "&:hover": { backgroundColor: theme.palette.primary.dark },
                }}
              >
                <Icon fontSize="small" />
              </IconButton>
            ))}
          </Box>
        </Box>

        {/* Dnd-kit Context */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter} 
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <Box 
            sx={{ 
              display: "flex", 
              gap: 2, 
              height: "calc(100vh - 120px)", 
              overflow: "hidden",
              pt: 0.5, 
              pb: 0.5 
            }}
          >
            {/* Main Content Area: Vehicles and Assigned Jobs */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flex: 1,
                overflowY: "auto",
                pr: 1,
                ...thinScrollbarStyles,
              }}
            >
              {/* Vehicles Column (Left) */}
              <Box 
                sx={{ 
                  width: "140px", 
                  minWidth: "140px", 
                  flexShrink: 0,
                }}
              >
                {allVehicles.map((vehicle, index) => (
                  <Box 
                    key={vehicle.id} 
                    sx={{ mb: 2.7 }}
                  >
                    <VehicleCard vehicle={vehicle} borderColor={vehicleColors[index % vehicleColors.length]} />
                  </Box>
                ))}
              </Box>

              {/* Assigned Jobs Column (Center) */}
              <Box 
                sx={{ 
                  flex: 1, 
                  display: "flex", 
                  flexDirection: "column", 
                  minWidth: 0,
                }}
              >
                {allVehicles.map((vehicle, index) => (
                  <DroppableJobContainer
                    key={vehicle.id}
                    id={vehicle.id} 
                    jobs={vehicle.assignedJobs}
                    isVehicleContainer={true}
                    vehicleColor={vehicleColors[index % vehicleColors.length]}
                  />
                ))}
              </Box>
            </Box>

            {/* Unassigned Jobs Column (Right) */}
            <Box
              sx={{
                width: isLargeScreen ? "380px" : "300px",
                minWidth: isLargeScreen ? "380px" : "300px",
                overflowY: "auto",
                ...thinScrollbarStyles,
                borderLeft: `1px solid ${theme.palette.divider}`,
                // Added vertical padding to align the content with the main section
                pt: 0.5,
                pb: 0.5,
              }}
            >
              <DroppableJobContainer
                id="unassigned-jobs"
                jobs={unassignedJobs}
                isVehicleContainer={false}
              />
            </Box>
          </Box>

          {/* Drag Overlay (Same as original) */}
          {createPortal(
            <DragOverlay dropAnimation={null}>
              {activeJob ? (
                <DragHandleWrapper
                  job={activeJob}
                  containerId={activeJobId === null ? 'unknown' : (assignedJobIds.has(activeJob.id) ? allVehicles.find(v => v.assignedJobs.some(j => j.id === activeJob.id))?.id || 'unassigned-jobs' : 'unassigned-jobs')}
                  isDraggingOverlay={true}
                />
              ) : null}
            </DragOverlay>,
            document.body
          )}
        </DndContext>
      </Box>

      {/* Processing Overlay (Same as original) */}
      {isProcessing && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <CircularProgress size={60} sx={{ color: "#fff" }} />
        </Box>
      )}
    </Layout>
  );
}

export default Allocations;
export const getServerSideProps = withPageAuthRequired();