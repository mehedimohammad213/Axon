// utils/themeUtils.js

export const setThemeColors = (themeColor, themeAccent) => {
  const root = document.documentElement;

  // Update CSS variables
  root.style.setProperty("--theme", themeColor);
  root.style.setProperty("--theme-dark", themeAccent);

  // Update other related variables if necessary
  root.style.setProperty("--themelite", `${themeColor}64`);
  root.style.setProperty("--themes", themeColor);
  root.style.setProperty("--themes-transparent", "#edf5fc");
  root.style.setProperty("--themes-light", `${themeColor}25`);
  root.style.setProperty("--theme-transparent", "#edf5fc");
};
