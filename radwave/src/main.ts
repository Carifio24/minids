import { createApp } from "vue";

import vuetify from "../plugins/vuetify";

import { WWTComponent, wwtPinia } from "@wwtelescope/engine-pinia";
import { IconButton } from "@minids/common";

import RadWave from "./RadWave.vue";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

createApp(RadWave, {
  wwtNamespace: "wwt-minids-radwave",
})

  .use(wwtPinia)
  .use(vuetify)
  
  .component("WorldWideTelescope", WWTComponent)
  .component("icon-button", IconButton)
  .component("font-awesome-icon", FontAwesomeIcon)
  
  .mount("#app");
