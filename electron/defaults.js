const backgroundColor = '#252526';

const titleBarStyle = 'hidden';
const inactiveTitleBarOverlay = {
  color: 'rgb(30, 34, 39)',
  symbolColor: 'rgba(248, 250, 253, 0.3)',
  height: 35
};
const activeTitleBarOverlay = {
  color: 'rgb(30, 34, 39)',
  symbolColor: 'rgba(248, 250, 253, 0.7)',
  height: 35
};

const defaultSettings = {};

const about = {
  copyright: "Ernst Reidinga © 2024",
  authors: ["Ernst Reidinga"],
  website: "https://erdesigns.dev",
};

module.exports = {
  backgroundColor: backgroundColor,
  titleBarStyle: titleBarStyle,
  inactiveTitleBarOverlay: inactiveTitleBarOverlay,
  activeTitleBarOverlay: activeTitleBarOverlay,
  defaultSettings: defaultSettings,
  about: about
};