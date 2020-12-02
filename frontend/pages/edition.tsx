import { useEffect, useState, createRef } from "react";
import {
  Grid,
  makeStyles,
  Button,
  Box,
  IconButton,
  withStyles,
  ButtonGroup,
} from "@material-ui/core";
import MapGL, { Source, Layer, FeatureState } from "@urbica/react-map-gl";
import { apiRest } from "@/lib/api";
import { useAppContext } from "@/providers/AppContext";
import SearchCity from "@/components/Map/SearchCity";
import { useTemplate } from "@/components/Template";
import { useRouter } from "next/router";
import TreeSummary from "@/components/Tree/Infos/Summary";
import dynamic from "next/dynamic";
import { bbox } from "@turf/turf";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

const Draw = dynamic(() => import("@urbica/react-map-gl-draw"), {
  ssr: false,
});

const useStyles = makeStyles((theme) => {
  return {
    root: {
      height: "100%",
      position: "relative",
    },
    toolbar: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
    },
    sidebar: {
      position: "absolute",
      top: 0,
      right: 0,
      height: "100%",
    },
    background: {
      position: "absolute",
      top: 0,
      right: 0,
      background: "#0D1821",
      height: "100%",
      width: "300px",
    },
    calendar: {
      height: "100%",
    },
    mapSearchCity: {
      position: "absolute",
      top: "1rem",
      right: "1rem",
      width: "300px",
    },
  };
});

const EditionPage = ({}) => {
  const classes = useStyles();
  const router = useRouter();
  const { dialog } = useTemplate();
  const { user } = useAppContext();
  const mapRef = createRef<MapGL>();
  const [firstLoad, setFirstLoad] = useState(true);
  const [viewport, setViewport] = useState({
    latitude: 46.7,
    longitude: 2.54,
    zoom: 5,
  });
  const [currentMode, setCurrentMode] = useState<string>("simple_select");
  const [mode, setMode] = useState<string>("simple_select");
  const [data, setData] = useState<any>({
    type: "FeatureCollection",
    features: [],
  });
  const [hoveredTreeId, setHoveredTreeId] = useState(null);
  const [boxSelect, setBoxSelect] = useState(false);

  const getData = async (organizationId: number) => {
    const newData = await apiRest.organization.geojson(organizationId);
    setData(newData);
  };

  useEffect(() => {
    if (user && user.currentOrganization) {
      getData(user.currentOrganization.id);
    }

    return () => {
      if (dialog.current) {
        dialog.current.close();
      }
    };
  }, [user, dialog]);

  useEffect(() => {
    if (mapRef.current && data.features.length > 0 && firstLoad) {
      try {
        const map = mapRef.current.getMap();
        map.fitBounds(bbox(data));
      } catch (e) {}
      setFirstLoad(false);
    }
  }, [data, mapRef]);

  useEffect(() => {
    if (router.query.tree) {
      apiRest.trees
        .get(user.currentOrganization.id, router.query.tree)
        .then((tree) => {
          openDialog(tree.id);
          mapRef.current.getMap().flyTo({
            zoom: 20,
            center: [tree.x, tree.y],
          });
        });
    }
  }, [router.query.tree]);

  const openDialog = (id) => {
    dialog.current.open({
      title: (
        <Grid container alignItems="flex-end" justify="flex-end">
          <Grid item xs>
            {id}
          </Grid>
          <Grid item>
            <IconButton
              size="small"
              onClick={() => {
                dialog.current.close();
              }}
            >
              <HighlightOffIcon />
            </IconButton>
          </Grid>
        </Grid>
      ),
      content: <TreeSummary id={id} />,
      isDraggable: true,
      dialogProps: {
        disableBackdropClick: true,
        hideBackdrop: true,
      },
    });
  };

  const onHover = (event) => {
    if (event.features.length > 0) {
      const nextHoveredTreeId = event.features[0].id;
      if (hoveredTreeId !== nextHoveredTreeId) {
        setHoveredTreeId(nextHoveredTreeId);
      }
    }
  };

  const onLeave = () => {
    if (hoveredTreeId) {
      setHoveredTreeId(null);
    }
  };

  const onClick = (event) => {
    if (mode !== "simple_select" || boxSelect) {
      return;
    }

    if (event.features.length > 0) {
      openDialog(event.features[0].properties.id);
    }
  };

  const DarkButton = withStyles((theme) => ({
    root: {
      color: "#fff",
      backgroundColor: "#212121",
      "&:hover": {
        backgroundColor: "#313131",
      },
    },
  }))(Button);

  return (
    <Grid className={classes.root} id="map-edition">
      <MapGL
        ref={mapRef}
        style={{ width: "100%", height: "100%" }}
        mapStyle="/api/v1/maps/style"
        latitude={viewport.latitude}
        longitude={viewport.longitude}
        zoom={viewport.zoom}
        onViewportChange={setViewport}
      >
        <Source id="trees" type="geojson" data={data ? data : null} />
        <Layer
          id="trees"
          type="circle"
          source="trees"
          paint={{
            "circle-color": [
              "case",
              ["boolean", ["feature-state", "click"], false],
              "#076ee4",
              "#ebb215",
            ],
            "circle-stroke-color": "#fff",
            "circle-stroke-width": [
              "case",
              ["boolean", ["feature-state", "click"], false],
              2,
              0,
            ],
            "circle-radius": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              12,
              5,
            ],
            "circle-pitch-scale": "map",
            "circle-opacity": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              1,
              0.8,
            ],
          }}
          onHover={onHover}
          onLeave={onLeave}
          onClick={onClick}
        />
        {boxSelect && (
          <Draw
            // @ts-ignore
            data={data}
            mode={mode}
            lineStringControl={false}
            combineFeaturesControl={false}
            uncombineFeaturesControl={false}
            displayControlsDefault={false}
            boxSelect={boxSelect}
            onDrawCreate={async (item) => {
              if (currentMode === "draw_point") {
                const [x, y] = item.features[0].geometry.coordinates;
                const newTree = {
                  x: x,
                  y: y,
                  properties: {},
                };

                await apiRest.trees.post(user.currentOrganization.id, newTree);
                await getData(user.currentOrganization.id);
              }
            }}
            onDrawDelete={async (selection) => {
              const ids = selection.features.map(
                (feature) => feature.properties.id
              );

              await apiRest.trees.bulkDelete(
                user.currentOrganization.id,
                JSON.stringify(ids)
              );
            }}
            onChange={(newData) => {
              setData(newData);
            }}
            onDrawModeChange={(drawMode) => {
              setMode(drawMode.mode);

              if (currentMode !== "simple_select") {
                setTimeout(() => {
                  setMode(currentMode);
                }, 200);
              }
            }}
          />
        )}
        {hoveredTreeId && (
          <FeatureState
            id={hoveredTreeId}
            source="trees"
            state={{ hover: true }}
          />
        )}
      </MapGL>
      <Box className={classes.toolbar} p={1}>
        <Grid container spacing={2} justify="center" alignItems="center">
          <Grid item xs></Grid>
          <Grid item>
            <ButtonGroup>
              <DarkButton
                onClick={() => {
                  setBoxSelect(false);
                }}
              >
                Information
              </DarkButton>
              <DarkButton
                onClick={() => {
                  setBoxSelect(true);
                  setMode("simple_select");
                  setCurrentMode("simple_select");
                }}
              >
                Selection
              </DarkButton>
              <DarkButton
                onClick={() => {
                  setBoxSelect(true);
                  setMode("draw_point");
                  setCurrentMode("draw_point");
                }}
              >
                + Arbre
              </DarkButton>
              <DarkButton
                onClick={() => {
                  setBoxSelect(true);
                  setMode("draw_polygon");
                  setCurrentMode("draw_polygon");
                }}
              >
                + Station
              </DarkButton>
            </ButtonGroup>
          </Grid>
          <Grid item xs></Grid>
          <Grid item>
            <SearchCity map={mapRef} />
          </Grid>
        </Grid>
      </Box>
    </Grid>
  );
};

export default EditionPage;
