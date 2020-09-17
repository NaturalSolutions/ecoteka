import { red } from "@material-ui/core/colors";

const themes = {
  light: {
    palette: {
      type: "light",
      primary: {
        main: "#01685a",
      },
      secondary: {
        main: "#19857b",
      },
      error: {
        main: red.A400,
      },
      toolbar: {
        main: "#fff",
      },
    },
  },
  dark: {
    palette: {
      type: "dark",
      primary: {
        main: "#fff",
      },
      secondary: {
        main: "#19857b",
      },
      error: {
        main: red.A400,
      },
      toolbar: {
        main: "#000",
      },
    },
  },
};

export default function getTheme(type) {
  return themes[type];
}
