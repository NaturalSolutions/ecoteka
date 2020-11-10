import React, { useState, useEffect } from "react";
import {
  Grid,
  Select,
  InputLabel,
  FormControl,
  MenuItem,
  Typography,
  Button,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import Geofile from "../../Geofile";
import useTreeSchema from "../../Tree/Schema";
import { apiRest } from "../../../lib/api";

export interface ETKImportPanelMappingProps {
  geofile?: Geofile;
  onCancel?(): void;
  onSend?(geofile?: Geofile): void;
}

const defaultProps: ETKImportPanelMappingProps = {
  geofile: undefined,
  onCancel: () => { },
  onSend: () => { },
};

const ETKImportPanelMapping: React.FC<ETKImportPanelMappingProps> = (props) => {
  const { t } = useTranslation("components");
  const treeSchema = useTreeSchema();
  const [properties, setProperties] = useState({});
  const [values, setValues] = useState({});

  useEffect(() => {
    if (props.geofile.properties) {
      try {
        const jsonProperties = JSON.parse(props.geofile.properties);
        setProperties(jsonProperties);

        const newValues = {};

        for (let property of Object.keys(treeSchema).filter(
          (f) => !["x", "y"].includes(f)
        )) {
          newValues[property] = "";
        }

        setValues(newValues);
      } catch (e) { }
    }
  }, []);

  const menuItems = Object.keys(properties)
    .concat("")
    .map((item) => {
      return (
        <MenuItem key={`menu-item-${item}`} value={item}>
          {item}
        </MenuItem>
      );
    });

  const onChange = (value, property) => {
    let newValues = Object.assign({}, values);

    console.log(newValues);

    newValues[property] = value;
    setValues(newValues);
  };

  const onSend = async () => {
    let data = {};

    for (let value in values) {
      if (values[value] && values[value] !== "") {
        data[value] = values[value];
      }
    }

    if (Object.keys(data).length > 0) {
      const newGeofile = { ...props.geofile } as Geofile;

      newGeofile.mapping_fields = JSON.stringify(data);
      const response = await apiRest.geofiles.update(newGeofile);
      props.onSend(response);
    } else {
      props.onSend(props.geofile)
    }
  };

  return (
    <Grid container direction="column" spacing={1}>
      <Grid item>
        <Typography variant="h6" paragraph>
          {t("ImportPanelMapping.title")}
        </Typography>
      </Grid>
      {Object.keys(treeSchema).map((property) => {
        return (
          <Grid key={`field-${property}`} item xs>
            <Grid container>
              <Grid item xs>
                <FormControl
                  size="small"
                  fullWidth
                  variant="outlined"
                >
                  <InputLabel>
                    {treeSchema[property].component.label}
                  </InputLabel>
                  <Select
                    name={property}
                    value={values[property]}
                    onChange={(e) =>
                      onChange(e.target.value, property)
                    }
                  >
                    {menuItems}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
        );
      })}
      <Grid item>
        <Grid container>
          <Button variant="outlined" onClick={props.onCancel}>
            {t("ImportPanelMapping.cancel")}
          </Button>
          <Grid item xs></Grid>
          <Button variant="contained" color="secondary" onClick={onSend}>
            {t("ImportPanelMapping.send")}
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
};

ETKImportPanelMapping.defaultProps = defaultProps;

export default ETKImportPanelMapping;
