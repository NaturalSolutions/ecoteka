import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core";
import { ToggleButtonGroup, ToggleButton } from "@material-ui/lab";
import MultilineChartIcon from "@material-ui/icons/MultilineChart";
import EditLocationIcon from "@material-ui/icons/EditLocation";

export type TMapMode = "analysis" | "edition";

export interface IMapModeSwitchProps {
  onChange?(value: TMapMode): void;
}

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.background.default,
  },
}));

const MapModeSwitch: React.FC<IMapModeSwitchProps> = ({ onChange }) => {
  const classes = useStyles();
  const [mode, setMode] = useState<TMapMode>("analysis");
  const { t } = useTranslation("components");

  const handleOnChange = (e, value: TMapMode) => {
    setMode(value);

    if (typeof onChange === "function") {
      onChange(value);
    }
  };

  return (
    <ToggleButtonGroup
      className={classes.root}
      value={mode}
      size="small"
      exclusive
      onChange={handleOnChange}
    >
      <ToggleButton value="analysis">
        <MultilineChartIcon />
        {t("MapModeSwitch.analysis")}
      </ToggleButton>
      <ToggleButton value="edition">
        <EditLocationIcon />
        {t("MapModeSwitch.edition")}
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default MapModeSwitch;
