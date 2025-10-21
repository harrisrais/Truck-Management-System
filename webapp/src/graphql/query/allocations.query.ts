import { gql } from "@apollo/client";

export const GET_ALLOCATION_DATA = gql`
  query GetAllocationData {
    getAllVehicles {
      id
      identifier
      licencePlate
      vehicleClass
      registrationExpiry
      assignedJobs {
        id
        jobReference
        pickupFrom
        pickupLocation {
          value
          label
        }
        deliverTo
        jobStatus
        deliverLocation {
          value
          label
        }
      }
    }
    jobs {
      id
      jobReference
      pickupFrom
      pickupLocation {
        value
        label
      }
      deliverTo
      jobStatus
      deliverLocation {
        value
        label
      }
       itemsList {
        name
        qty
        unit
      }
    }
  }
`;

export const ASSIGN_JOB_TO_VEHICLE = gql`
  mutation AssignJobToVehicle($vehicleId: ID!, $jobId: ID!) {
    assignJobToVehicle(vehicleId: $vehicleId, jobId: $jobId) {
      id
      identifier
      registrationExpiry
      assignedJobs {
        id
        jobReference
        pickupFrom
        deliverTo
        jobStatus
          itemsList {
            name
            qty
            unit
          }
      }
    }
  }
`;

export const UNASSIGN_JOB_FROM_VEHICLE = gql`
  mutation UnassignJobFromVehicle($vehicleId: ID!, $jobId: ID!) {
    unassignJobFromVehicle(vehicleId: $vehicleId, jobId: $jobId) {
      id
      identifier
      registrationExpiry
      assignedJobs {
        id
        jobReference
        pickupFrom
        deliverTo
        jobStatus
          itemsList {
            name
            qty
            unit
          }
      }
    }
  }
`;
