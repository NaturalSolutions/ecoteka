import { red } from "@material-ui/core/colors";

const themes = {
  light: {
    palette: {
      type: "light",
      primary: {
        main: "#00796b",
      },
      secondary: {
        main: "#795548",
      },
      toolbar: {
        main: "#fff",
      },
    },
  },
  dark: {
    palette: {
      type: "dark",
      action: {
        active: "rgba(255,255,255,.8)",
        hover: "#fff",
      },
      background: {
        default: "#222",
      },
      text: {
        primary: "#fff",
      },
      primary: {
        main: "#AFE9A1",
      },
      secondary: {
        main: "#344966",
      },
    },
  },
};

export default function getTheme(type) {
  return themes[type];
}
