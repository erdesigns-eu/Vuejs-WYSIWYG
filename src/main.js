import "@mdi/font/scss/materialdesignicons.scss";
import "@/styles/index.scss";
import App from "@/App.vue";
import Messages from "@/locales";
import { ElectronVueApp } from "@/classes/electron-vue-app.js";

// import { ServerManager } from "@/classes/server-manager";
// const serverManager = new ServerManager();

// Create a new ElectronVueApp instance and pass in the App template
// and locale messages, provide the serverManager and mount it
// to the #app element in the index.html file
export default new ElectronVueApp(App, Messages)
  //.provide("serverManager", serverManager)
  .mount("body");
