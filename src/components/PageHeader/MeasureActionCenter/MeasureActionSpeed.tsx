import React, { useState } from 'react';
import { SpeedDial, SpeedDialAction } from '@mui/material';
import { DeleteOutlined as DeleteIcon } from '@mui/icons-material';
import AdbIcon from '@mui/icons-material/Adb';
import AccessibilityIcon from '@mui/icons-material/Accessibility';
import AddHomeWorkIcon from '@mui/icons-material/AddHomeWork';

const actions = [
    { icon: <DeleteIcon />, name: 'Delete' },
    { icon: <AdbIcon />, name: 'adasdad' },
    { icon: <AccessibilityIcon />, name: 'hyrteg' },
    { icon: <AddHomeWorkIcon />, name: 'vdfdsdc' },
    
  ];

const SpeedDialActions = ()=>{
    return actions.map((action,index) => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          tooltipTitle={action.name}
        //   onClick={() => setOpen(false)} 
        />
        
      ))
}

  export default SpeedDialActions;