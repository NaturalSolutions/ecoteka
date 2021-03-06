import {
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Button,
} from "@material-ui/core";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { TIntervention } from "@/components/Interventions/Schema";
import { useRouter } from "next/router";

const InterventionsTable: FC<{
  tree: any;
  interventions: TIntervention[];
  onNewIntervention?(): void;
}> = ({ interventions, tree, onNewIntervention }) => {
  const { t } = useTranslation("components");
  const router = useRouter();
  //TODO generic
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  };

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <caption>
          <Button
            fullWidth
            size="small"
            color="primary"
            variant="outlined"
            onClick={() => {
              onNewIntervention();
              router.push(`/map/?panel=intervention&tree=${tree.id}`);
            }}
          >
            {t(
              "components.Intervention.interventionsTable.requestAnItervention"
            )}
          </Button>
        </caption>
        <TableHead>
          <TableRow>
            <TableCell>{t("Intervention.interventionsTable.date")}</TableCell>
            <TableCell>{t("Intervention.interventionsTable.type")}</TableCell>
            <TableCell>{t("Intervention.interventionsTable.state")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {interventions.length > 0 &&
            interventions.map((intervention, i) => {
              return (
                <TableRow key={i}>
                  <TableCell>
                    {intervention.date && formatDate(intervention.date)}
                    {!intervention.date &&
                      `${formatDate(
                        intervention.intervention_start_date
                      )} - ${formatDate(intervention.intervention_end_date)}`}
                  </TableCell>
                  <TableCell>
                    {t(`Intervention.types.${intervention.intervention_type}`)}
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      disabled
                      checked={intervention.done}
                      color="primary"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default InterventionsTable;
