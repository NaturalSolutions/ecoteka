import React from "react";
import { makeStyles, Grid, Box } from "@material-ui/core";
import { useDrag } from "react-dnd";
import { ItemTypes } from "./ItemTypes";

export interface ETKScheduleIternventionHeaderTileBoxProps {
  itemId: number;
  backgroundColor: string;
}

const defaultProps: ETKScheduleIternventionHeaderTileBoxProps = {
  itemId: 0,
  backgroundColor: "white",
};

const useStyles = makeStyles(() => ({
  root: {},
  box: {
    width: "1rem",
    height: "1rem",
  }
}));

const ETKScheduleIternventionHeaderTileBox: React.FC<ETKScheduleIternventionHeaderTileBoxProps> = (
  props
) => {
  const classes = useStyles();
  const [{ isDragging }, drag] = useDrag({
    item: { type: ItemTypes.BOX },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <Grid key={`month-intervention-${props.itemId}`} item>
      <Box
        ref={drag}
        className={classes.box}
        style={{
          backgroundColor: props.backgroundColor,
          
        }}
      />
    </Grid>
  );
};

ETKScheduleIternventionHeaderTileBox.defaultProps = defaultProps;

export default ETKScheduleIternventionHeaderTileBox;