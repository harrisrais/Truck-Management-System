//webapp\src\components\jobs\JobCard.tsx
import React from "react";
import { Box, Typography, useTheme, IconButton, Tooltip } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

interface Job {
  id: string;
  jobReference: string;
  pickupFrom: string;
  deliverTo: string;
  pickupLocation?: { value: string; label: string };
  deliverLocation?: { value: string; label: string };
  jobStatus?: string;
  itemsList: { name: string; qty: string | number; unit: string }[];
}

interface JobCardProps {
  job: Job;
  isDragging?: boolean;
}

const getJobColor = (status?: string): string => {
  if (!status || status === 'idle') return '#ff9800'; // Orange for idle/unassigned
  if (status === 'complete') return '#4caf50'; // Green for completed
  if (status === 'In Progress') return '#2196f3'; // Blue for in progress
  return '#ff9800'; // Default orange
};

const JobCard: React.FC<JobCardProps> = ({ job, isDragging }) => {
  const theme = useTheme();
  const headerColor = getJobColor(job.jobStatus);
  console.log("JOBS", job);

  const tooltipTitle = `Ref: ${job.jobReference}
${job.pickupFrom}
${job.pickupLocation?.label || "N/A"}
${job.deliverTo}
${job.deliverLocation?.label || "N/A"}
${job.itemsList?.length
      ? job.itemsList
        .map((item: { name: string; qty: string | number; unit: string }) =>
          `- ${item.name} (${item.qty} ${item.unit})`
        )
        .join("\n")
      : "N/A"}`;

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider} `,
        borderRadius: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: "180px",
        maxHeight: "180px",
        cursor: "grab",
        transition: "all 0.2s ease-in-out",
        opacity: isDragging ? 0.6 : 1,
        transform: isDragging ? "rotate(3deg)" : "none",
        boxShadow: isDragging ? theme.shadows[8] : theme.shadows[1],
        "&:hover": {
          boxShadow: theme.shadows[4],
          transform: "translateY(-2px)",
        },
        "&:active": {
          cursor: "grabbing",
        },
      }}
    >
      {/* Header with Job Reference */}
      <Box
        sx={{
          backgroundColor: headerColor,
          color: "#fff",
          p: 1,
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "0.875rem",
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
        }}
      >
        Ref: {job.jobReference}
      </Box>

      {/* Job Details */}
      <Box sx={{ p: 1.5, flexGrow: 1, overflow: "hidden" }}>
        <Typography
          variant="body2"
          sx={{
            fontSize: "0.813rem",
            fontWeight: 500,
            color: theme.palette.text.primary,
            mb: 0.9,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={job.pickupFrom}
        >
          {job.pickupFrom}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            fontSize: "0.75rem",
            color: theme.palette.text.secondary,
            mb: 0.9,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={job.pickupLocation?.label}
        >
          {job.pickupLocation?.label || "N/A"}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            fontSize: "0.813rem",
            fontWeight: 500,
            color: theme.palette.text.primary,
            mb: 0.9,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={job.deliverTo}
        >
          {job.deliverTo}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            fontSize: "0.75rem",
            color: theme.palette.text.secondary,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={job.deliverLocation?.label}
        >
          {job.deliverLocation?.label || "N/A"}
        </Typography>
        {/* <Typography
          variant="body2"
          sx={{
            fontSize: "0.75rem",
            color: theme.palette.text.secondary,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={
            job.itemsList?.length
              ? job.itemsList
                .map(
                  (item: { name: string; qty: string | number; unit: string }) =>
                    `${item.name} (${item.qty} ${item.unit})`
                )
                .join(", ")
              : "N/A"
          }
        >
          {job.itemsList?.length
            ? job.itemsList
              .map(
                (item: { name: string; qty: string | number; unit: string }) =>
                  `${item.name} (${item.qty} ${item.unit})`
              )
              .join(", ")
            : "N/A"}
        </Typography> */}
      </Box>

      {/* Info Button with Tooltip */}
      <Box sx={{ display: "flex", justifyContent: "flex-end",  }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end",  }}>
          <Tooltip
            title={(
              <pre style={{ margin: 0, fontFamily: 'inherit' }}>
                {/* Apply bold and larger font size only to "Job Details:" */}
                <span style={{ fontWeight: 'bold', fontSize: '1.1em' }}>
                  Job Details:
                </span>
                {`\n${tooltipTitle} `}
              </pre>
            )}
            arrow
            placement="bottom"
          >
            <IconButton size="small" sx={{  }}>
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};

export default JobCard;