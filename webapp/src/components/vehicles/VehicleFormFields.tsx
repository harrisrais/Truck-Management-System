import React, { useState, useCallback } from "react";
import {
  TextField,
  MenuItem,
  FormControl,
  Select,
  Typography,
  Box,
  Stack,
  FormHelperText,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Grid,
  Divider,
  InputLabel,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  Controller,
  Control,
  FieldErrors,
  UseFormWatch,
  UseFormSetValue,
} from "react-hook-form";
import { VEHICLE_FIELDS, VehicleField } from "@/config/vehicleFieldsConfig";
import { parseISO } from "date-fns";
import {
  FLEET_OPTIONS,
  VEHICLE_CLASS_OPTIONS,
  SHIFT_TEMPLATE_OPTIONS,
  DOCUMENT_TYPE_OPTIONS,
  FORM_OPTIONS,
} from "@/utils/vehicleContants";
import useDragAndDrop from "@/hooks/useDragAndDrop";

interface Document {
  name: string;
  size: number;
  documentType?: string;
  documentDate?: Date | string | null;
}

type VehicleFormData = {
  [key: string]: any;
  allowShifts?: string;
  documents?: Document[];
};

interface VehicleFormFieldsProps {
  control: Control<VehicleFormData>;
  errors: FieldErrors<VehicleFormData>;
  watch: UseFormWatch<VehicleFormData>;
  setValue: UseFormSetValue<VehicleFormData>;
  documents: Document[];
  handleDocumentAction: (
    type: "ADD" | "REMOVE" | "UPDATE",
    payload: any
  ) => void;
}

const getOptions = (optionKey: string) => {
  const optionMap: Record<string, { label: string; value: string }[]> = {
    FLEET_OPTIONS,
    VEHICLE_CLASS_OPTIONS,
    SHIFT_TEMPLATE_OPTIONS,
    FORM_OPTIONS,
  };
  return optionMap[optionKey] || [];
};

export default function VehicleFormFields({
  control,
  errors,
  watch,
  setValue,
  documents,
  handleDocumentAction,
}: VehicleFormFieldsProps) {
  const [openDatePickers, setOpenDatePickers] = useState<
    Record<string, boolean>
  >({});
  const allowShifts = watch("allowShifts");
  const [isDragging, dragHandlers] = useDragAndDrop((files) =>
    handleDocumentAction("ADD", { files })
  );

  const handleOpenDatePicker = (name: string, value: boolean) => {
    setOpenDatePickers((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      handleDocumentAction("ADD", { files });
      e.target.value = "";
    },
    [handleDocumentAction]
  );

  const renderFormField = (
    labelText: string,
    isRequired: boolean,
    controlElement: React.ReactNode
  ) => (
    <Grid
      container
      spacing={3}
      sx={{ mb: 3 }}
      alignItems="flex-start"
    >
      <Grid size={{ xs: 12, sm: 3 }}>
        <Typography
          sx={{ textAlign: { xs: "left", sm: "right" }, width: "100%", mt: 1 }}
        >
          {labelText}
          {isRequired && (
            <span style={{ color: "red", marginLeft: "4px" }}>*</span>
          )}
        </Typography>
      </Grid>
      <Grid
        size={{ xs: 12, sm: 9 }}
        sx={{ "& .MuiFormHelperText-root": { ml: 0, pl: 0 } }}
      >
        {controlElement}
      </Grid>
    </Grid>
  );

  const renderTextField = (name: string, required = false) => (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const [localError, setLocalError] = useState<string>("");

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const rawValue = e.target.value;
          let cleanedValue = rawValue;

          // Pattern for Identifier and Licence Plate: Allows letters, numbers, space, and hyphen
          const allowedPatternWithSpace = /^[A-Za-z0-9- ]*$/;

          // Pattern for VIN/Chassis/Engine Number: Allows only letters and numbers
          const validAlphaNumericPattern = /^[A-Za-z0-9]*$/;

          // *** NEW Pattern for Make: Allows only letters and spaces ***
          const validAlphabeticWithSpacePattern = /^[A-Za-z ]*$/;

          // *** 1. Logic for Make Field ***
          if (name === "make") {
            if (!validAlphabeticWithSpacePattern.test(rawValue)) {
              setLocalError("Enter only alphabets and spaces.");
              // Strip out any characters NOT in the alphabetic pattern
              cleanedValue = rawValue.replace(/[^A-Za-z ]/g, "");
              field.onChange(cleanedValue);
              return;
            } else {
              setLocalError("");
            }
          }

          // *** 2. Existing Logic for Identifier and Licence Plate ***
          if (name === "identifier" || name === "licencePlate") {
            if (!allowedPatternWithSpace.test(rawValue)) {
              setLocalError("Only letters, numbers, spaces, and '-' are allowed.");
              cleanedValue = rawValue.replace(/[^A-Za-z0-9- ]/g, "");
              field.onChange(cleanedValue);
              return;
            } else {
              setLocalError("");
            }
          }

          // *** 3. Existing Logic for VIN/Chassis/Engine Number ***
          if (name === "vinChassisNumber" || name === "engineNumber") {
            if (!validAlphaNumericPattern.test(rawValue)) {
              setLocalError("Enter only numbers or alphabets");
              cleanedValue = rawValue.replace(/[^A-Za-z0-9]/g, "");
              field.onChange(cleanedValue);
              return;
            } else {
              setLocalError("");
            }
          }

          // *** 4. Default/Fall-through Logic ***
          field.onChange(cleanedValue);
        };

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
          const currentValue = e.target.value;
          const trimmedValue = currentValue.trim();

          if (currentValue !== trimmedValue) {
            field.onChange(trimmedValue);
          }
          field.onBlur();
        };

        return (
          <TextField
            {...field}
            value={field.value || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            fullWidth
            required={required}
            error={!!errors[name] || !!localError}
            helperText={localError || (errors[name]?.message as string) || ""}
            placeholder={`Enter ${name
              .replace(/([A-Z])/g, " $1")
              .trim()
              .split(" ")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
              .join(" ")}`}
            size="small"
            sx={{ "& .MuiFormHelperText-root": { ml: 0, pl: 0 } }}
          />
        );
      }}
    />
  );

const renderNumberField = (name: string, required = false) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => {
      const [localError, setLocalError] = useState<string>("");

      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;

        // Allow digits and at most one decimal point
        const validNumberPattern = /^\d*\.?\d*$/;

        // Block non-numeric and non-decimal characters
        const nonAllowedChars = /[-+eE]/g;

        if (nonAllowedChars.test(rawValue)) {
          setLocalError("Please enter only numeric values.");
          const cleanedValue = rawValue.replace(nonAllowedChars, "");
          field.onChange(cleanedValue);
          return;
        }

        // Check if the value matches the allowed pattern (digits + optional single ".")
        if (!validNumberPattern.test(rawValue)) {
          setLocalError("Invalid number format.");
          return;
        }

        setLocalError("");
        field.onChange(rawValue);
      };

      const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const invalidKeys = ["e", "E", "+", "-"];

        // Prevent scientific notation or sign symbols
        if (invalidKeys.includes(e.key)) {
          e.preventDefault();
          setLocalError("Please enter only numeric values.");
          setTimeout(() => setLocalError(""), 1500);
        }

        // Allow only one decimal point
        if (e.key === ".") {
          if ((e.currentTarget.value || "").includes(".")) {
            e.preventDefault();
            setLocalError("Only one decimal point is allowed.");
            setTimeout(() => setLocalError(""), 1500);
          }
        }
      };

      return (
        <TextField
          {...field}
          type="number"
          fullWidth
          required={required}
          error={!!errors[name] || !!localError}
          helperText={localError || (errors[name]?.message as string) || ""}
          value={field.value || ""}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={`Enter ${name
            .replace(/([A-Z])/g, " $1")
            .trim()
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(" ")}`}
          size="small"
          InputProps={{
            inputProps: {
              onWheel: (e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur(),
            },
          }}
          sx={{
            "& .MuiFormHelperText-root": { ml: 0, pl: 0 },
            "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button": {
              WebkitAppearance: "none",
              margin: 0,
            },
            "& input[type=number]": {
              MozAppearance: "textfield",
            },
          }}
        />
      );
    }}
  />
);


  const renderSelectField = (
    name: string,
    options: { value: string; label: string }[],
    required = false,
    disabled = false
  ) => (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControl
          fullWidth
          required={required}
          error={!!errors[name]}
          size="small"
          disabled={disabled}
        >
          <Select {...field} displayEmpty>
            <MenuItem value="">
              <Typography color="text.secondary">Select</Typography>
            </MenuItem>
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {errors[name] && (
            <FormHelperText>{errors[name]?.message as string}</FormHelperText>
          )}
        </FormControl>
      )}
    />
  );

  const renderFieldByType = (field: VehicleField) => {
    const { type, key, required, options, conditional } = field;

    if (conditional === "allowShifts" && allowShifts === "No") {
      return renderSelectField(
        key,
        getOptions(options as string),
        required,
        true
      );
    }

    switch (type) {
      case "text":
        return renderTextField(key, required);
      case "number":
        return renderNumberField(key, required);
      case "select":
        return renderSelectField(key, getOptions(options as string), required);
      case "toggle":
        return (
          <Controller
            name={key}
            control={control}
            render={({ field }) => (
              <ToggleButtonGroup
                {...field}
                exclusive
                value={field.value}
                onChange={(_, newValue) => {
                  if (newValue !== null) field.onChange(newValue);
                }}
                sx={{
                  "& .MuiToggleButton-root": {
                    height: "35px",
                    width: "40px",
                    flex: 1,
                  },
                  "& .MuiToggleButton-root.Mui-selected": {
                    color: "#6893e4ff", // text color when selected
                  },
                }}
              >
                <ToggleButton value="Yes">YES</ToggleButton>
                <ToggleButton value="No">NO</ToggleButton>
              </ToggleButtonGroup>
            )}
          />
        );
      case "date":
        return (
          <Controller
            name={key}
            control={control}
            render={({ field: { onChange, value, ref, ...restField } }) => (
              <DatePicker
                value={value}
                onChange={onChange}
                open={openDatePickers[key] || false}
                onOpen={() => handleOpenDatePicker(key, true)}
                onClose={() => handleOpenDatePicker(key, false)}
                format="MM/dd/yyyy"
                minDate={new Date(new Date().setDate(new Date().getDate() + 1))}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required,
                    error: !!errors[key],
                    helperText: errors[key]?.message as string,
                    size: "small",
                    inputRef: ref,
                    onClick: () => handleOpenDatePicker(key, true),
                    onKeyDown: (e) => e.preventDefault(),
                    onPaste: (e) => e.preventDefault(),
                    sx: {
                      cursor: "pointer",
                      "& .MuiFormHelperText-root": { ml: 0, pl: 0 },
                    },
                    InputProps: {
                      readOnly: true,
                      sx: { cursor: "pointer" },
                    },
                    ...restField,
                  },
                  actionBar: { actions: ["clear"] },
                }}
              />
            )}
          />
        );
      case "file_advanced":
        return (
          <FormControl fullWidth>
            <Box
              sx={{
                border: `1px solid ${isDragging ? "primary.main" : "#e0e0e0"}`,
                backgroundColor: isDragging
                  ? "primary.main"
                  : "background.secondary",
                borderRadius: "4px",
                p: 3,
                textAlign: "center",
                cursor: "pointer",
              }}
              {...dragHandlers}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <input
                id="file-input"
                type="file"
                multiple
                hidden
                onChange={handleFileChange}
                accept=".png,.jpeg,.jpg,.pdf,.doc,.txt,.csv,.docx,.xls,.xlsx,.rtf"
              />
              <Typography variant="body1">
                Drag & drop or click to browse
              </Typography>
            </Box>

            {/* Uploaded Documents */}
            {documents?.length > 0 && (
              <Box sx={{ mt: 2, textAlign: "left" }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Uploaded Files:
                </Typography>
                <Stack spacing={2}>
                  {documents.map((doc, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Grid container spacing={1}>
                        {/* Document name with close button inline */}
                        <Grid size={{ xs: 12 }}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography variant="body2">
                              {doc.name} ({Math.round(doc.size / 1024)} KB)
                            </Typography>
                            <IconButton
                              aria-label="delete"
                              onClick={() =>
                                handleDocumentAction("REMOVE", { index })
                              }
                              size="small"
                              sx={{ ml: "auto" }}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Grid>

                        {/* Divider */}
                        <Grid size={{ xs: 12 }}>
                          <Divider />
                        </Grid>

                        {/* Document Type and Date */}
                        <Grid size={{ xs: 12, sm: 6 }} sx={{ mt: 1 }}>
                          <FormControl
                            fullWidth
                            size="small"
                            error={!!errors.documents?.[index]?.documentType}
                          >
                            <InputLabel>Document Type</InputLabel>
                            <Select
                              value={doc.documentType || ""}
                              label="Document Type"
                              onChange={(e) =>
                                handleDocumentAction("UPDATE", {
                                  index,
                                  field: "documentType",
                                  value: e.target.value,
                                })
                              }
                            >
                              {DOCUMENT_TYPE_OPTIONS.map((option) => (
                                <MenuItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                            {errors.documents?.[index]?.documentType && (
                              <FormHelperText>
                                {errors.documents[index].documentType.message}
                              </FormHelperText>
                            )}
                          </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }} sx={{ mt: 1 }}>
                          <DatePicker
                            label="Date"
                            minDate={new Date(new Date().setDate(new Date().getDate() + 1))}
                            open={
                              openDatePickers[`documentDate-${index}`] || false
                            }
                            onOpen={() =>
                              handleOpenDatePicker(
                                `documentDate-${index}`,
                                true
                              )
                            }
                            onClose={() =>
                              handleOpenDatePicker(
                                `documentDate-${index}`,
                                false
                              )
                            }
                            value={
                              doc.documentDate instanceof Date
                                ? doc.documentDate
                                : doc.documentDate
                                  ? parseISO(doc.documentDate)
                                  : null
                            }
                            onChange={(newValue) =>
                              handleDocumentAction("UPDATE", {
                                index,
                                field: "documentDate",
                                value: newValue,
                              })
                            }
                            format="MM/dd/yyyy"
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                size: "small",
                                error:
                                  !!errors.documents?.[index]?.documentDate,
                                helperText:
                                  errors.documents?.[index]?.documentDate
                                    ?.message,
                                InputProps: {
                                  readOnly: true,
                                  sx: { cursor: "pointer" },
                                },
                                sx: {
                                  cursor: "pointer",
                                  "& .MuiFormHelperText-root": {
                                    ml: 0,
                                    pl: 0,
                                  },
                                },
                                onClick: () =>
                                  handleOpenDatePicker(
                                    `documentDate-${index}`,
                                    true
                                  ),
                                onKeyDown: (e) => e.preventDefault(),
                                onPaste: (e) => e.preventDefault(),
                              },
                              actionBar: { actions: ["clear"] },
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </FormControl>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: { xs: 0, sm: 2 } }}>
      {VEHICLE_FIELDS.map((field, index) => (
        <React.Fragment key={index}>
          <Grid key={index}>
            {renderFormField(
              field.label,
              !!field.required,
              renderFieldByType(field)
            )}
          </Grid>
        </React.Fragment>
      ))}
    </Box>
  );
}
