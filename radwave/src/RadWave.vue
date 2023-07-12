<template>
  <v-app
    id="app"
    :style="cssVars"
  >
    <div
      id="main-content"
    >
      <WorldWideTelescope
        :wwt-namespace="wwtNamespace"
      ></WorldWideTelescope>
    </div>
  </v-app>
</template>

<script lang="ts">
import { MiniDSBase } from "@minids/common";
import { SpreadSheetLayer } from "@wwtelescope/engine";
import { AltUnits } from "@wwtelescope/engine-types";
import { defineComponent } from "vue";
import { csv } from "d3-fetch";

import radwaveData from "./assets/RW_dust_oscillation_phase.csv";

const R2D = 180.0 / Math.PI;

type SheetType = "text" | "video" | null;

async function parseCsvTable(path: string) {
  return csv(path, (d) => {
    return {
      name: d.name,
      l: +(d.l ?? ""),
      b: +(d.b ?? ""),
      d50: +(d.d50 ?? ""),
      ra: +(d.ra ?? ""),
      dec: +(d.dec ?? "")
    };
  });
}

export default defineComponent({
  extends: MiniDSBase,

  async mounted() {
    console.log(this);
    const data = radwaveData.replace(/,/g, '\t').replace(/\n/g, '\r\n');  // WWT needs CRLF
    this.waitForReady().then(async () => {
      this.setBackgroundImageByName("Solar System");
      this.setForegroundImageByName("Solar System");
      this.applySetting(["solarSystemStars", true]);
      this.applySetting(["actualPlanetScale", true]);
      this.applySetting(["solarSystemCMB", true]);
      this.gotoRADecZoom({
        raRad: 114.85 * R2D,
        decRad: -29.52 * R2D,
        zoomDeg: 6e9,
        instant: true
      });
      const layer = await this.createTableLayer({
        name: "Radcliffe Wave",
        referenceFrame: "Sky",
        dataCsv: data 
      });
      layer.set_xAxisColumn(1);
      layer.set_yAxisColumn(2);
      layer.set_zAxisColumn(3);
      layer.set_altUnit(AltUnits.parsecs);
      console.log(layer);
    });
  },

  data() {
    return {
      sheet: null as SheetType,
      showTextTooltip: false,
      majorCatalogsLayer: null as SpreadSheetLayer | null
    };
  },

  computed: {
    showTextSheet: {
      get(): boolean {
        return this.sheet === 'text';
      },
      set(_value: boolean) {
        this.selectSheet('text');
        this.showTextTooltip = false;
      }
    },

    cssVars() {
      return {
        '--app-content-height': this.showTextSheet ? '66%' : '100%'
      };
    }
  },

  methods: {
    selectSheet(name: SheetType) {
      if (this.sheet == name) {
        this.sheet = null;
        this.$nextTick(() => {
          this.blurActiveElement();
        });
      } else {
        this.sheet = name;
      }
    }
  }
});
</script>

<style lang="less">
html {
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: #000;
  overflow: hidden;

  ::-webkit-scrollbar {
    display: none;
  }

  -ms-overflow-style: none;
  scrollbar-width: none;
}

body {
  position: fixed;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;

  font-family: Verdana, Arial, Helvetica, sans-serif;
}

#main-content {
  position: fixed;
  width: 100%;
  height: var(--app-content-height);
  overflow: hidden;
  transition: height 0.1s ease-in-out;
}

#app {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;

  .wwtelescope-component {
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    border-style: none;
    border-width: 0;
    margin: 0;
    padding: 0;
  }
}


</style>
