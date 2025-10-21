import * as yup from "yup";
import { isFuture, isToday } from "date-fns";

const maxFileSize = 5242880; // 5MB

// Field definition types
export type FieldType =
  | "text"
  | "select"
  | "toggle"
  | "number"
  | "date"
  | "file_advanced";

// Document file type - aligned with VehicleForm interface
export interface DocumentFile {
  name: string;
  size: number;
  type: string;
  dataUrl?: string; // Added optional dataUrl
  documentType?: string | null;
  documentDate?: Date | null;
}

// Validation schema factory
export const createVehicleValidationSchema = (
  entityData: any,
  existingIdentifiers: string[],
  existingLicencePlates: string[]
) => {
  // 1. Determine if we are in edit mode (entityData will contain the vehicle being edited)
  const isEditing = !!entityData?.id;

  // 2. Conditionally filter the existing lists
  //    If editing, filter out the current vehicle's original identifier/licence plate 
  //    so it doesn't fail uniqueness against itself.

  const identifiersForValidation = isEditing
    ? existingIdentifiers.filter(
      (id) => id !== entityData.identifier
    )
    : existingIdentifiers;

  const licencePlatesForValidation = isEditing
    ? existingLicencePlates.filter(
      (plate) => plate !== entityData.licencePlate
    )
    : existingLicencePlates;

  return yup.object().shape({
    identifier: yup
      .string()
      .transform((value) => value?.trim())
      .required("Identifier is required")
      .matches(/^[A-Za-z0-9- ]+$/, "Identifier can only contain letters, numbers, and '-'")
      .min(5, "Identifier must be at least 5 characters")
      .max(14, "Identifier cannot exceed 14 characters")
      .notOneOf(identifiersForValidation, "Identifier must be unique"), // <-- Use filtered list

    licencePlate: yup
      .string()
      .transform((value) => value?.trim())
      .required("Licence Plate is required")
      .matches(/^[A-Za-z0-9- ]+$/, "Licence Plate can only contain letters, numbers, and '-'")
      .min(5, "Licence Plate must be at least 5 characters")
      .max(14, "Licence Plate cannot exceed 14 characters")
      .notOneOf(licencePlatesForValidation, "Licence Plate must be unique"), // <-- Use filtered list
    fleets: yup.string().nullable().default(""),
    vehicleClass: yup.string().required("Vehicle Class is required"),
    formSelection: yup.string().required("Form is required"),
    allowShifts: yup
      .string()
      .required("Allow Shifts is required")
      .default("Yes"),
    shiftTemplates: yup.string().nullable().default(""),

    vinChassisNumber: yup
      .string()
      .nullable()
      .transform((value) => (value?.trim() === "" ? null : value))
      .matches(
        /^[A-Za-z0-9]+$/,
        "VIN/Chassis Number can only contain alphabets and numbers"
      )
      .min(6, "VIN/Chassis Number must be at least 6 characters")
      .max(14, "VIN/Chassis Number cannot exceed 14 characters"),

    engineNumber: yup
      .string()
      .nullable()
      .transform((value) => (value?.trim() === "" ? null : value))
      .matches(
        /^[A-Za-z0-9]+$/,
        "Engine Number can only contain alphabets and numbers"
      )
      .min(6, "Engine Number must be at least 6 characters")
      .max(14, "Engine Number cannot exceed 14 characters"),

    tonnage: yup
      .number()
      .required("Tonnage is required")
      .transform((value: unknown, originalValue: unknown) =>
        String(originalValue).trim() === "" ? null : value
      )
      .min(1, "Tonnage must be at least 1")
      .typeError("Tonnage must be a number"),
    make: yup
      .string()
      .transform((value) => (value ? value.trim() : null)) 
      .nullable()
      .transform((value: string | null | undefined) =>
        value === "" ? null : value
      )
      .matches(/^[A-Za-z- ]+$/, "Only contain letters, spaces, and '-' are allowed.")
      .matches(/^[A-Za-z\s]*$/, "Make should only contain letters")
      .min(3, "Make should be at least 3 characters")
      .max(14, "Make cannot exceed 14 characters")
      .test(
        "make-optional",
        "Make should be at least 3 characters if provided",
        (value: string | null | undefined) => {
          return !value || value.length === 0 || value.length >= 3;
        }
      )
      .default(""),
    registrationExpiry: yup
      .date()
      .required("Registration Expiry is required")
      .typeError("Invalid Date")
      .transform((value, original) => (original === "" ? null : value))
      .test(
        "is-future-or-today-date",
        "Registration Expiry must be today's date or a future date",
        (value: Date | null | undefined) => {
          if (!value) return true;
          return isFuture(value) || isToday(value);
        }
      ),
    odometerReading: yup
      .number()
      .required("Odometer Reading is required")
      .transform((value: unknown, originalValue: unknown) =>
        String(originalValue).trim() === "" ? null : value
      )
      .min(1, "Odometer Reading must be at least 1")
      .typeError("Odometer Reading must be a number"),
    axles: yup
      .number()
      .nullable()
      .transform((value: unknown, originalValue: unknown) =>
        String(originalValue).trim() === "" ? null : value
      )
      .integer("Axles must be a whole number")
      .min(1, "Axles must be at least 1")
      .typeError("Axles must be a number"),
    documents: yup
      .array()
      .of(
        yup.object().shape({
          name: yup.string().required("Document name is required"),
          size: yup
            .number()
            .required("Document size is required")
            .max(maxFileSize, "File size must be less than 5MB"),
          type: yup
            .string()
            .required("Document file type is required")
            .test(
              "file-type",
              "Unsupported file type. Allowed: .png, .jpeg, .jpg, .pdf, .doc, .txt, .csv, .docx, .xls, .xlsx, .rtf",
              (value: string | null | undefined) => {
                if (!value) return false;
                const allowedMimeTypes = [
                  "image/png",
                  "image/jpeg",
                  "application/pdf",
                  "application/msword",
                  "text/plain",
                  "text/csv",
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                  "application/vnd.ms-excel",
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                  "application/rtf",
                ];
                return allowedMimeTypes.includes(value);
              }
            ),
          dataUrl: yup.string().optional(),
          documentType: yup.string().nullable().default(""),
          documentDate: yup
            .date()
            .nullable()
            .transform((value, originalValue) => {
              if (!originalValue || originalValue === "") return null;
              return new Date(originalValue); // force convert string → Date
            })
            .typeError("Invalid document date"),
        })
      )
      .nullable()
      .default([]),
  });
};
