import { gql } from "@apollo/client";

export const JOB_ASSIGNED_SUBSCRIPTION = gql`
  subscription OnJobAssigned {
    assignJobToVehicle {
      vehicle {
        id
        registrationExpiry
        assignedJobs {
          id
          jobReference
          pickupFrom
          deliverTo
        }
      }
      job {
        id
        jobReference
        pickupFrom
        deliverTo
          itemsList {
          name
          qty
          unit
        }
      }
    }
  }
`;

export const JOB_UNASSIGNED_SUBSCRIPTION = gql`
  subscription OnJobUnassigned {
    unassignJobFromVehicle {
      vehicle {
        id
        registrationExpiry
        assignedJobs {
          id
          jobReference
          pickupFrom
          deliverTo
        }
      }
      job {
        id
        jobReference
        pickupFrom
        deliverTo
          itemsList {
          name
          qty
          unit
        }
      }

    }
  }
`;
