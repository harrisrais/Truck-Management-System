//webapp\src\components\vehicles\VehicleCard.tsx
import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { useUser } from "@auth0/nextjs-auth0/client";

interface Vehicle {
  id: string;
  identifier: string;
  licencePlate: string;
  vehicleClass?: string;
  assignedJobs?: any[];
}

interface VehicleCardProps {
  vehicle: Vehicle;
  borderColor: string;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, borderColor }) => {
  const theme = useTheme();
  const { user } = useUser();

  const ellipsisStyle = {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap', // Forces the text onto a single line
    width: '100%', // Ensures the text block has a defined width
  };

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderLeft: `4px solid ${borderColor}`,
        borderRadius: 1,
        p: 1,
        minHeight: "180px",
        maxHeight: "180px",
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: theme.shadows[3],
          transform: 'translateY(-1px)',
        },
      }}
    >
      {/* Vehicle Status Indicator */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0.5, mt: 0.5 }}>
        <Box
          sx={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            backgroundColor: theme.palette.error.main,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `2px solid ${theme.palette.background.paper}`,
            boxShadow: theme.shadows[1],
          }}
        >
          <Box
            sx={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              backgroundColor: theme.palette.common.white,
            }}
          />
        </Box>
      </Box>

      {/* Vehicle Identifier */}
      <Box sx={{ textAlign: 'center', mb: 0.5, mt: 1 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            color: theme.palette.text.primary,
            fontSize: '1rem',
            lineHeight: 1.2,
            ...ellipsisStyle,  
          }}
        >
          {vehicle.identifier}
        </Typography>
      </Box>

      {/* Vehicle Details */}
      <Box sx={{ textAlign: 'center', flexGrow: 1, mt: 1.5  }}>
        <Typography
           variant="h6"
          sx={{
            color: theme.palette.text.secondary,
            fontSize: '0.9rem',
             ...ellipsisStyle,
            lineHeight: 1.4,
            mb: 1,
          }}
        >
          {vehicle.licencePlate}
        </Typography>
        <Typography
           variant="h6"
          sx={{
            color: theme.palette.text.secondary,
            fontSize: '0.9rem',
            lineHeight: 1.4,
             ...ellipsisStyle,
             mb: 1,
          }}
        >
          {vehicle.vehicleClass || 'N/A'}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            fontSize: '0.9rem',
             ...ellipsisStyle,
            lineHeight: 1.4,
          }}
        >
          {user?.nickname || "Unknown Driver"}
        </Typography>
      </Box>
    </Box>
  );
};

export default VehicleCard;