import mongoose, { Schema, Document } from "mongoose";

export interface IDocument {
  name: string;
  size: number;
  type: string;
  dataUrl: string;
  documentType: string;
  documentDate?: Date | null;
}

export interface IVehicle extends Document {
  _id: string;
  identifier: string;
  owner: string;
  fleets?: string | null;
  licencePlate: string;
  vehicleClass: "light_vehicle" | "heavy_combination" | "motorcycle";
  allowShifts?: string | null;
  shiftTemplates?: string | null;
  vinChassisNumber?: number | null;
  engineNumber?: number | null;
  tonnage: number;
  make?: string | null;
  registrationExpiry: Date;
  odometerReading: number;
  formSelection: string;
  axles?: number | null;
  documents?: IDocument[] | null;
  assignedJobs: mongoose.Types.ObjectId[];
}

const DocumentSchema = new Schema<IDocument>({
  name: { type: String, required: [true, "Document name is required"] },
  size: {
    type: Number,
    required: [true, "Document size is required"],
    max: [5242880, "File must be less than 5MB"],
  },
  type: {
    type: String,
    required: [true, "Document type is required"],
    enum: {
      values: [
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
      ],
      message: "Unsupported file type",
    },
  },
  dataUrl: { type: String },
  documentType: { type: String, default: "" },
  documentDate: { type: Date, default: null },
});

const VehicleSchema = new Schema<IVehicle>(
  {
    identifier: {
      type: String,
      required: [true, "Identifier is required"],
      minlength: [5, "Identifier must be at least 5 characters"],
      maxlength: [14, "Identifier cannot exceed 14 characters"],
      trim: true,
      validate: [
        {
          validator: (v: string) => v.trim().length > 0,
          message: "Identifier cannot be empty or spaces only",
        },
        {
          validator: (v: string) => /^[A-Za-z0-9-]+$/.test(v),
          message: "Identifier can only contain letters, numbers, and '-'",
        },
      ],
    },

    licencePlate: {
      type: String,
      required: [true, "Licence Plate is required"],
      minlength: [5, "Licence Plate must be at least 5 characters"],
      maxlength: [14, "Licence Plate cannot exceed 14 characters"],
      trim: true,
      validate: [
        {
          validator: (v: string) => v.trim().length > 0,
          message: "Licence Plate cannot be empty or spaces only",
        },
        {
          validator: (v: string) => /^[A-Za-z0-9-]+$/.test(v),
          message: "Licence Plate can only contain letters, numbers, and '-'",
        },
      ],
    },

    fleets: { type: String, default: "" },
    owner: { type: String, required: [true, "Owner is required"] },

    vehicleClass: {
      type: String,
      required: [true, "Vehicle Class is required"],
      enum: {
        values: ["light_vehicle", "heavy_combination", "motorcycle"],
        message: "Must be a valid vehicle class",
      },
    },

    allowShifts: { type: String, default: "Yes" },
    shiftTemplates: { type: String, default: "" },

    vinChassisNumber: {
      type: String,
      default: null,
      validate: {
        validator: (v: string | null) =>
          v === null || /^[0-9]{6,14}$/.test(v),
        message: "VIN/Chassis Number must be 6–14 digits",
      },
    },

    engineNumber: {
      type: String,
      default: null,
      validate: {
        validator: (v: string | null) =>
          v === null || /^[0-9]{6,14}$/.test(v),
        message: "Engine Number must be 6–14 digits",
      },
    },

    // ✅ Allow ANY number of decimal places
    tonnage: {
      type: Number,
      required: [true, "Tonnage is required"],
      min: [0, "Tonnage must be at least 0"],
    },

    make: {
      type: String,
      default: "",
      trim: true,
      validate: {
        validator: (v: string | null) =>
          !v || (/^[A-Za-z\s]*$/.test(v) && v.trim().length >= 3 && v.trim().length <= 14),
        message: "Make should only contain letters and be 3–14 characters if provided",
      },
    },

    registrationExpiry: {
      type: Date,
      required: [true, "Registration Expiry is required"],
      validate: {
        validator: (v: Date) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return v >= today;
        },
        message: "Registration Expiry must be today or a future date",
      },
    },

    // ✅ Allow ANY number of decimal places
    odometerReading: {
      type: Number,
      required: [true, "Odometer Reading is required"],
      min: [0, "Odometer Reading must be at least 0"],
    },

    formSelection: {
      type: String,
      required: [true, "Form selection is required"],
    },

    axles: { type: Number, default: null, min: [1, "Axles must be at least 1"] },

    documents: { type: [DocumentSchema], default: [] },

    assignedJobs: [
      {
        type: Schema.Types.ObjectId,
        ref: "Job",
        default: [],
      },
    ],
  },
  { timestamps: true, collection: "vehicles" }
);

// ✅ Compound unique indexes
VehicleSchema.index({ owner: 1, identifier: 1 }, { unique: true });
VehicleSchema.index({ owner: 1, licencePlate: 1 }, { unique: true });

export const Vehicle = mongoose.model<IVehicle>("Vehicle", VehicleSchema);
