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

      <div class="bottom-content">
        <v-slider
          discrete
          v-model="phase"
          min="0"
          max="360"
          step="10"
        ></v-slider>
      </div>
    </div>
  </v-app>
</template>

<script lang="ts">
import { MiniDSBase } from "@minids/common";
import { Color, SpreadSheetLayer } from "@wwtelescope/engine";
import { AltUnits, CoordinatesType, MarkerScales } from "@wwtelescope/engine-types";
import { defineComponent } from "vue";
import { csvFormatRows, csvParse } from "d3-dsv";

import radwaveData from "./assets/RW_dust_oscillation_phase.csv";

const R2D = 180.0 / Math.PI;

type SheetType = "text" | "video" | null;

function parseCsvTable(string: string, phase: number) {
  return csvParse(string, (d) => {
    const rowPhase = +(d.phase ?? "-1");
    if (phase !== rowPhase) {
      return null;
    }
    return {
      phase,
      x: +(d.x ?? ""),
      y: +(d.y ?? ""),
      z: +(d.z ?? ""),
    };
  });
}

type Table = ReturnType<typeof parseCsvTable>;

function formatCsvTable(table: Table): string {
  return csvFormatRows([[
    "phase", "x", "y", "z"
  ]].concat(table.map((d, _i) => {
    return [
      d.phase.toString(),
      d.x.toString(),
      d.y.toString(),
      d.z.toString(),
    ];
  }))).replace(/\n/g, '\r\n'); // WWT needs CRLF
}

export default defineComponent({
  extends: MiniDSBase,

  async mounted() {
    console.log(this);
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
      this.updateLayer(this.phase);
    });
  },

  data() {
    return {
      sheet: null as SheetType,
      showTextTooltip: false,
      layer: null as SpreadSheetLayer | null,
      phase: 0
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
    },

    async updateLayer(phase: number) {
      if (this.layer !== null) {
        this.deleteLayer(this.layer.id);
      }
      const table = parseCsvTable(radwaveData, phase);
      const data = formatCsvTable(table);
      this.layer = await this.createTableLayer({
        name: "Radcliffe Wave",
        referenceFrame: "Sky",
        dataCsv: data 
      });
      this.layer.set_xAxisColumn(1);
      this.layer.set_yAxisColumn(2);
      this.layer.set_zAxisColumn(3);
      this.layer.set_coordinatesType(CoordinatesType.rectangular);
      this.layer.set_cartesianScale(AltUnits.parsecs);
      this.layer.set_color(Color.load("#ff0000"));
      this.layer.set_showFarSide(true);
      this.layer.set_scaleFactor(25);
      this.layer.set_markerScale(MarkerScales.screen);
    }
  },

  watch: {
    phase(phase: number) {
      this.updateLayer(phase);    
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

.bottom-content {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  width: calc(100% - 2rem);
}

</style>
