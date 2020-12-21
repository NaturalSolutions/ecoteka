import { useRouter } from "next/router";
import { Button, Grid, Box, Typography } from "@material-ui/core";
import WarningIcon from "@material-ui/icons/Warning";
import { useAppContext } from "@/providers/AppContext";
import { apiRest } from "@/lib/api";
import { useTranslation } from "react-i18next";
import { useAppLayout } from "@/components/AppLayout/Base";

export interface ETKLogoutProps {
  buttonProps?: any;
  onClick?: () => void;
}

const ETKLogout: React.FC<ETKLogoutProps> = (props) => {
  const { t } = useTranslation("components");
  const { dialog } = useAppLayout();
  const { setUser } = useAppContext();
  const router = useRouter();

  const dialogContent = (
    <Box mx={10} py={2}>
      <Grid container direction="column" alignItems="center" spacing={2}>
        <Grid item>
          <WarningIcon style={{ color: "#ff9629" }} fontSize="large" />
        </Grid>
        <Grid item>
          <Typography>{t("Logout.dialog.content")}</Typography>
        </Grid>
      </Grid>
    </Box>
  );

  const actions = [
    {
      label: t("Logout.dialog.backHome"),
      color: "primary",
      variant: "text",
      size: "large",
      onClick: () => {
        if (props.onClick) {
          props.onClick();
        }

        router.push("/");
      },
    },
    {
      label: t("Logout.dialog.logout"),
      color: "primary",
      variant: "contained",
      size: "large",
      onClick: () => {
        if (props.onClick) {
          props.onClick();
        }

        apiRest.auth.logout();
        setUser(null);
      },
    },
  ];

  return (
    <Button
      {...props.buttonProps}
      onClick={(e) => {
        dialog.current.open({
          title: t("Logout.dialog.logout"),
          content: dialogContent,
          actions,
        });
      }}
    >
      {t("Logout.logout")}
    </Button>
  );
};

export default ETKLogout;
