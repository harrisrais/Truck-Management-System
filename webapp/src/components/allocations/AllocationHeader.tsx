import React from "react";
import {
  Box,
  IconButton,
  Select,
  MenuItem,
  Typography,
  FormControl,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import PauseIcon from "@mui/icons-material/Pause";
import RefreshIcon from "@mui/icons-material/Refresh";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";

// --- Types for Props ---
interface AllocationHeaderProps {
  selectedDate: Dayjs | null;
  setSelectedDate: (date: Dayjs | null) => void;
  selectedShift: string;
  setSelectedShift: (shift: string) => void;
}

export default function AllocationHeader({
  selectedDate,
  setSelectedDate,
  selectedShift,
  setSelectedShift,
}: AllocationHeaderProps) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 2,
        pl: 3,
        borderBottom: `1px solid ${theme.palette.divider}`,
        pb: 1,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {/* Date Picker */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            value={selectedDate}
            format="MM/DD/YYYY"
            minDate={dayjs()}

            onChange={(newValue) => setSelectedDate(newValue)}
            slotProps={{
              textField: {
                size: "small",
                onKeyDown: (e) => e.preventDefault(),
                onPaste: (e) => e.preventDefault(),
                onClick: () => setOpen(true),
                InputProps: {
                  readOnly: true,
                  sx: { cursor: "pointer" },
                },
                sx: {
                  width: "250px",
                  label: "Date",
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    "& fieldset": { borderColor: theme.palette.text.secondary },
                    "&:hover fieldset": {
                      borderColor: theme.palette.text.primary,
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: theme.palette.text.secondary,
                  },
                },
              },
              actionBar: { actions: ["clear"] },
            }}
          />
        </LocalizationProvider>
        {/* Shift Selector */}
        <FormControl variant="outlined" size="small" sx={{ width: "250px" }}>
          <Select
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
            displayEmpty
            sx={{
              backgroundColor: theme.palette.background.secondary,
              color: theme.palette.text.primary,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.text.secondary,
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.text.primary,
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.primary.main,
              },
              "& .MuiSelect-icon": {
                color: theme.palette.text.primary,
              },
            }}
          >
            <MenuItem value="">
              <Typography color="text.secondary">Select</Typography>
            </MenuItem>
            <MenuItem value="Shift A">Shift A</MenuItem>
            <MenuItem value="Shift B">Shift B</MenuItem>
          </Select>
        </FormControl>
      </Box>
      {/* Action Icons */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, pr: 2 }}>
        {[SearchIcon, FilterListIcon, PauseIcon, RefreshIcon].map(
          (Icon, index) => (
            <IconButton
              key={index}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                "&:hover": {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
            >
              <Icon />
            </IconButton>
          )
        )}
      </Box>
    </Box>
  );
}