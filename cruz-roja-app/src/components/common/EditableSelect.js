import React from 'react';
import { Select, MenuItem, CircularProgress } from '@mui/material';

export const EditableSelect = React.memo(({ 
  value, 
  options, 
  isUpdating, 
  onChange 
}) => {
  if (isUpdating) return <CircularProgress size={20} />;
  
  return (
    <Select
      value={value || ""}
      onChange={onChange}
      size="small"
      sx={{ minWidth: 110 }}
    >
      {options.map(option => (
        <MenuItem key={option} value={option}>{option}</MenuItem>
      ))}
    </Select>
  );
});

EditableSelect.displayName = 'EditableSelect';
