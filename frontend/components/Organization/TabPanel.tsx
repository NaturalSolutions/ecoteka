import React, { FC } from "react";
import { Box } from "@material-ui/core";

interface TabPanelProps {
  children: any;
  index: string;
  value: string | string[];
  props?: any;
}

const TabPanel: FC<TabPanelProps> = ({ children, value, index, ...props }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-force-tabpanel-${index}`}
      aria-labelledby={`scrollable-force-tab-${index}`}
      {...props}
    >
      {value === index && (
        <Box p={3} mt={2}>
          {children}
        </Box>
      )}
    </div>
  );
};

export default TabPanel;
