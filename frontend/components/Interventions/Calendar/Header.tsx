import React from "react";
import {
  makeStyles,
  Grid,
  Button,
  IconButton,
  Typography,
} from "@material-ui/core";
import { ArrowBackIos, ArrowForwardIos } from "@material-ui/icons";
import { TIntervention } from "@/components/Interventions/Schema";
import CalendarTodoIntervention from "@/components/Interventions/Calendar/TodoIntervention";

export interface CalendarHeaderProps {
  todoInterventions: TIntervention[];
  year: number;
  onYearChange?(newYear: number): void;
}

const TODAY = new Date();

const defaultProps: CalendarHeaderProps = {
  todoInterventions: [],
  year: TODAY.getFullYear(),
};

const useStyles = makeStyles(() => ({
  root: {},
}));

const CalendarHeader: React.FC<CalendarHeaderProps> = (props) => {
  const classes = useStyles();

  const renderTodoInterventions = () =>
    props.todoInterventions.map((todoIntervention) => (
      <CalendarTodoIntervention
        key={`todo-intervention-${todoIntervention.id}`}
        todoIntervention={todoIntervention}
      />
    ));

  return (
    <Grid container alignItems="center">
      <Button
        variant="outlined"
        onClick={() => {
          props.onYearChange(TODAY.getFullYear());
        }}
      >
        Today
      </Button>
      <IconButton
        size="medium"
        onClick={() => props.onYearChange(props.year - 1)}
      >
        <ArrowBackIos />
      </IconButton>
      <Typography variant="h6">{props.year}</Typography>
      <IconButton onClick={() => props.onYearChange(props.year + 1)}>
        <ArrowForwardIos />
      </IconButton>
      <Grid item>
        <Grid container spacing={1}>
          {renderTodoInterventions()}
        </Grid>
      </Grid>
    </Grid>
  );
};

CalendarHeader.defaultProps = defaultProps;

export default CalendarHeader;