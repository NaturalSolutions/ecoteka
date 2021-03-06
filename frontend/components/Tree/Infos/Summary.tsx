import { FC, useState, useEffect } from "react";
import useApi from "@/lib/useApi";
import { Button, Grid, makeStyles } from "@material-ui/core";
import InterventionsTable from "@/components/Interventions/InterventionsTable";
import { useAppContext } from "@/providers/AppContext";
import TreeExpanded from "@/components/Tree/Infos/Expanded";
import { useAppLayout } from "@/components/AppLayout/Base";
import { TIntervention } from "@/components/Interventions/Schema";
import TreeInfosProperties from "@/components/Tree/Infos/Properties";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";

const useStyles = makeStyles(() => ({
  root: {
    width: "24rem",
  },
}));

const Summary: FC<{ treeId: number }> = ({ treeId }) => {
  const { user } = useAppContext();
  const { api } = useApi();
  const { apiETK } = api;
  const { t } = useTranslation("components");
  const [tree, setTree] = useState<any>({});
  const [interventions, setInterventions] = useState<TIntervention[]>();
  const { dialog } = useAppLayout();
  const classes = useStyles();
  const router = useRouter();

  const getTree = async (itreeIdd) => {
    if (user?.currentOrganization) {
      try {
        const { data, status } = await apiETK.get(
          `/organization/${user.currentOrganization.id}/trees/${treeId}`
        );
        if (status === 200) {
          setTree(data);
        }
      } catch (error) {
        //
      }
    }
  };
  const getInterventions = async (treeId: number) => {
    if (user?.currentOrganization) {
      try {
        const { data, status } = await apiETK.get(
          `/organization/${user.currentOrganization.id}/trees/${treeId}/interventions`
        );
        if (status === 200) {
          setInterventions(data);
        }
      } catch (error) {
        //
      }
    }
  };

  useEffect(() => {
    if (treeId) {
      getTree(treeId);
      getInterventions(treeId);
    }
  }, [treeId, user]);

  const handleOnEdit = () => {
    router.push(`/map?panel=edit&tree=${treeId}`);
  };

  return (
    <Grid className={classes.root} container direction="column" spacing={2}>
      <Grid item>
        <TreeInfosProperties tree={tree} />
      </Grid>
      <Grid item>
        <Button
          fullWidth
          variant="outlined"
          color="primary"
          onClick={handleOnEdit}
        >
          {t("components.Tree.summary.moreDetails")}
        </Button>
      </Grid>
      <Grid item>
        {interventions && (
          <InterventionsTable
            interventions={interventions}
            tree={tree}
            onNewIntervention={() => {
              dialog.current.close();
            }}
          />
        )}
      </Grid>
    </Grid>
  );
};

export default Summary;
