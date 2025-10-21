// Helper Function & Custom Hook used Inside JobRoute.tsx
import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type IJobFormState from "@/entities/types/jobTypes";
import { contacts, locations } from "@/utils/jobConstants";

// Helper to get locations for a contact
export const getLocationsForContact = (contactValue: string) => {
  const selectedContact = contacts.find((c) => c.value === contactValue);
  if (!selectedContact) return [];

  return Object.entries(locations)
    .filter(([_, loc]) => loc.contactId === selectedContact.id)
    .map(([key, loc]) => ({
      value: key,
      label: loc.label,
    }));
};

// Custom hook
export const useAutoSelectLocation = (
  contactField: "pickupFrom" | "deliverTo",
  locationField: "pickupLocation" | "deliverLocation"
) => {
  const { control, setValue } = useFormContext<IJobFormState>();
  const contactValue = useWatch({ name: contactField, control });

  useEffect(() => {
    if (contactValue) {
      const availableLocations = getLocationsForContact(contactValue);

      if (availableLocations.length === 1) {
        // Safe: type is {value,label} | null
        setValue(locationField, availableLocations[0]);
      } else {
        setValue(locationField, null);
      }
    } else {
      setValue(locationField, null);
    }
  }, [contactValue, setValue, locationField]);
};
