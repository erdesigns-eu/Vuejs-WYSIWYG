import "@mdi/font/scss/materialdesignicons.scss";
import "@/styles/index.scss";
import App from "@/App.vue";
import Messages from "@/locales";
import { ElectronVueApp } from "@/classes/electron-vue-app.js";

// Create a new ElectronVueApp instance and pass in the App template
// and locale messages and mount it to the #app element in the index.html file
export default new ElectronVueApp(App, Messages).mount("body");
