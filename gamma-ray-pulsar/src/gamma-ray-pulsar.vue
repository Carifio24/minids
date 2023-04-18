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
      @pointerdown="wwtOnPointerDown"
      @pointermove="wwtOnPointerMove"
      @pointerup="wwtOnPointerUp"
    ></WorldWideTelescope>
    
    <!--<v-overlay
      :model-value="showSplashScreen"
      absolute
      opacity="0.6"
      id="splash-overlay"
    >
      <img
        id="splash-screen"
        :src="require(`./assets/Green_Comet_Mini_Splashscreen_wVideo.png`)"
        v-click-outside="closeSplashScreen"
        contain
      />
      <a
        id="splash-close"
        @click="closeSplashScreen">
      </a>
    </v-overlay>-->

    <transition name="fade">
      <div
        class="modal"
        id="modal-loading"
        v-show="isLoading"
      >
        <div class="container">
          <div class="spinner"></div>
          <p>Loading …</p>
        </div>
      </div>
    </transition>

    <div class="top-content">
      <div id="credits" class="ui-text">
        <div id="icons-container">
          <transition-expand-two>  
            <a v-if=!showControls href="https://worldwidetelescope.org/home/" target="_blank"
              > Powered by AAS WorldWide Telescope</a
            >
          </transition-expand-two>          
          <a href="https://worldwidetelescope.org/home/" target="_blank"
            ><img alt="WWT Logo" src="../../assets/logo_wwt.png"
          /></a>
      
          <!--<ShareNetwork
            v-for="network in networks"
            :key="network.name"
            :network="network.name"
            :class="`${network.name}-button`"
            :style="{ backgroundColor: network.color, width: 'fit-content' }"
            :description="description"
            :url="url"
            :title="title"
            :hashtags="hashtagString"
            :quote="description"
            twitter-user="WWTelescope"
          >
            <font-awesome-icon
              :class="`${network.name}-icon`"
              :icon="['fab', network.name]"
              size="lg"
            ></font-awesome-icon>
          </ShareNetwork>-->
        </div>
      </div>
      <!--<div
        id="video-icon-dummy"
        class="control-icon-wrapper"
      >
        <font-awesome-icon
          id="video-icon"
          class="control-icon"
          icon="video"
          size="lg"
        ></font-awesome-icon>
      </div>-->
    </div>

    <div
      id="close-popover"
      v-show="lastClosePt !== null"
      :style="popoverCssVars"
    >
      {{ lastClosePt?.name }}
    </div>
    
    <div class="left-content">
      <div
        id="controls"
        class="control-icon-wrapper"
      >
        <div id="controls-top-row">
          <font-awesome-icon
            size="lg"
            class="ma-1"
            :icon="showControls ? `chevron-down` : `gear`"
            @click="showControls = !showControls"
            @keyup.enter="showControls = !showControls"
            tabindex="0"
          />
        </div>
        <transition-expand>
          <div v-if="showControls" class="controls-content">
            <v-checkbox
              :color="colorRed"
              v-model="showConstellations"
              @keyup.enter="showConstellations = !showConstellations"
              label="Constellations"
              class="constellations"
              hide-details
            />
            <div class="data-label">
              <p>
                Young Pulsars
              </p>
            </div>    
            <v-checkbox
              :color="color0"
              v-model="yrqp"
              @keyup.enter="yrqp = !yrqp"
              label="Radio Quiet"
              class="radio-quiet"
              hide-details
            />
            <v-checkbox
              :color="color1"
              v-model="yrlp"
              @keyup.enter="yrlp = !yrlp"
              label="Radio Loud"
              class="radio-loud"
              hide-details
            />
            <div class="data-label">
              <p>
                Millisecond Pulsars
              </p>
            </div>
            <v-checkbox
              :color="color2"
              v-model="imp"
              @keyup.enter="imp = !imp"
              label="Isolated"
              class="isolated"
              hide-details
            />
            <v-checkbox
              :color="color3"
              v-model="bmp"
              @keyup.enter="bmp = !bmp"
              label="Binary"
              class="binary"
              hide-details
            />
            <div class="data-label">
              <p id="spyder-sys">
                Spider Systems
              </p>
            </div>
            <v-checkbox
              :color="color4"
              v-model="bws"
              @keyup.enter="bws = !bws"
              label="Black Widow"
              class="black-widow"
              hide-details
            />
            <v-checkbox
              :color="color5"
              v-model="rs"
              @keyup.enter="rs = !rs"
              label="Redback"
              class="redback"
              hide-details
            />
            <!--<v-checkbox
              :color="color0"
              v-model="showAltAzGrid"
              @keyup.enter="showAltAzGrid = !showAltAzGrid"
              label="Grid"
              hide-details
            />-->
            <!--<v-btn
              v-if="curBackgroundImagesetName = this.bgName"
              block
              :label=Gamma
              @click="this.curBackgroundImagesetName = this.fgName;">
            </v-btn>-->
          </div>
        </transition-expand>
      </div>
    </div>
    
    <div class="bottom-content">
      
      
      <template v-if="currentTool == 'crossfade'">
          <span
            class="ui-text slider-label"
            @click="foregroundOpacity = 0"
            @keyup.enter="foregroundOpacity = 0"
            tabindex="0"
          >Optical<br></span>
          <input
            class="opacity-range"
            type="range"
            v-model="foregroundOpacity"
          />
          <span
            class="ui-text slider-label"
            @click="foregroundOpacity = 100"
            @keyup.enter="foregroundOpacity = 100"
            tabindex="0"
          >Gamma Ray<br></span>
      </template>
      
    </div>

    <!-- <v-dialog
      id="video-container"
      v-model="showVideoSheet"
      transition="slide-y-transition"
      fullscreen
    >
      <div class="video-wrapper">
        <font-awesome-icon
          id="video-close-icon"
          class="close-icon"
          icon="times"
          size="lg"
          @click="showVideoSheet = false"
          @keyup.enter="showVideoSheet = false"
          tabindex="0"
        ></font-awesome-icon>
        <video
          controls
          id="info-video"
        >
          <source src="./assets/video2.mp4" type="video/mp4">
        </video>
      </div>
    </v-dialog> -->

  </div>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { csvFormatRows, csvParse } from "d3-dsv";

import { distance } from "@wwtelescope/astro";
import { Color, Constellations, Folder, Grids, Layer, LayerManager, Poly, RenderContext, Settings, SpreadSheetLayer, WWTControl } from "@wwtelescope/engine";
import { ImageSetType, MarkerScales, PlotTypes, PointScaleTypes, Thumbnail } from "@wwtelescope/engine-types";

import L, { LeafletMouseEvent, Map } from "leaflet";
import { tween } from "femtotween";
import { MiniDSBase, BackgroundImageset, skyBackgroundImagesets } from "@minids/common";

import { ImageSetLayer, Place, Imageset } from "@wwtelescope/engine";
import { applyImageSetLayerSetting, applySpreadSheetLayerSetting } from "@wwtelescope/engine-helpers";

import { drawSkyOverlays, initializeConstellationNames, makeAltAzGridText, drawSpreadSheetLayer, layerManagerDraw } from "./wwt-hacks";

interface MoveOptions {
  instant?: boolean;
  zoomDeg?: number;
  rollRad?: number;
}

import {
  youngRadioQuietPulsarCsv,
  youngRadioLoudPulsarCsv,
  isolatedMillisecondPulsarCsv,
  binaryMillisecondPulsarCsv,
  blackWidowSystemCsv,
  redbackSystemCsv,
} from "./data";

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;


function parseCsvTable(csv: string) {
  return csvParse(csv, (d) => {
    return {
      grpname: d.Name!,  // + makes it a number - we don't want that here
      ra: +d.RA!,
      dec: +d.DEC!,
      freq: +d.frequency!,
      grptype: +d.keyCode!,
    };
  });
}

const youngRadioQuietPulsarTable = parseCsvTable(youngRadioQuietPulsarCsv);
const youngRadioLoudPulsarTable = parseCsvTable(youngRadioLoudPulsarCsv);
const isolatedMillisecondPulsarTable = parseCsvTable(isolatedMillisecondPulsarCsv);
const binaryMillisecondPulsarTable = parseCsvTable(binaryMillisecondPulsarCsv);
const blackWidowSystemTable = parseCsvTable(blackWidowSystemCsv);
const redbackSystemTable = parseCsvTable(redbackSystemCsv);

type Table = typeof youngRadioQuietPulsarTable;
type TableRow = typeof youngRadioQuietPulsarTable[number];

function formatCsvTable(table: Table): string {
  return csvFormatRows([[
    "Name", "RA", "Dec", "Frequency" , "Type"
  ]].concat(table.map((d, _i) => {
    return [
      d.grpname.toString(),
      d.ra.toString(),
      d.dec.toString(),
      d.freq.toString(),
      d.grptype.toString(),
    ];
  }))).replace(/\n/g, '\r\n');
  // By using a regex, we replace all instances.
  // For WWT implementation reasons (left over from 
  // the Windows client?), we need the line endings 
  // to be CRLF
}

const youngRadioQuietPulsarString = formatCsvTable(youngRadioQuietPulsarTable);
const youngRadioLoudPulsarString = formatCsvTable(youngRadioLoudPulsarTable);
const isolatedMillisecondPulsarString = formatCsvTable(isolatedMillisecondPulsarTable);
const binaryMillisecondPulsarString = formatCsvTable(binaryMillisecondPulsarTable);
const blackWidowSystemString = formatCsvTable(blackWidowSystemTable);
const redbackSystemString = formatCsvTable(redbackSystemTable);

type LocationRad = {
  longitudeRad: number;
  latitudeRad: number;
};

type EquatorialRad = {
  raRad: number;
  decRad: number;
};

type HorizontalRad = {
  altRad: number;
  azRad: number;
};

interface PointData {
  x: number;
  y: number;
  ra: number;
  dec: number;
  name: string;
  color: Color;
}

type ToolType = "crossfade" | "choose-background" | null;
type SheetType = "text" | "video" | null;

export default defineComponent({
  extends: MiniDSBase,
  
  props: {
    wtml: {
      type: Object,
      required: true
    },
    wwtNamespace: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    thumbnailUrl: {
      type: String,
      required: true
    },
    bgWtml: {
      type: String,
      required: true
    },
    bgName: {
      type: String,
      required: true
    },
    fgName: {
      type: String,
      required: true
    },
  },
  data() {
    return {
      showSplashScreen: true,
      imagesetLayers: {} as Record<string, ImageSetLayer>,
      layersLoaded: false,
      positionSet: false,
      imagesetFolder: null as Folder | null,
      backgroundImagesets: [] as BackgroundImageset[],
      cfOpacity: 0,
      layers: {} as Record<string,ImageSetLayer>,

      playing: false,

      showAltAzGrid: false,
      showConstellations: false,

      currentAllLayer: null as SpreadSheetLayer | null,
      
      color0: "#4c8bff",
      color1: "#00b27a",
      color2: "#ffaa00",
      color3: "#8901bd",
      color4: "#00c9ff",
      color5: "#ff0000",
      colorD: "#45aecb", //#1671e0
      colorRed: "#ffffff",
      todayColor: "#D6B004",
      
      yrlp: true,
      yrlpLayer: null as SpreadSheetLayer | null,
      yrqp: true,
      yrqpLayer: null as SpreadSheetLayer | null,
      imp: true,
      impLayer: null as SpreadSheetLayer | null,
      bmp: true,
      bmpLayer: null as SpreadSheetLayer | null,
      bws: true,
      bwsLayer: null as SpreadSheetLayer | null,
      rs: true,
      rsLayer: null as SpreadSheetLayer | null,
      

      incomingItemSelect: null as Thumbnail | null,
      
      sheet: null as SheetType,
      showMapTooltip: false,
      showTextTooltip: false,
      showVideoTooltip: false,
      showPlayPauseTooltip: false,
      showLocationSelector: false,
      showControls: false,
      currentTool: "crossfade" as ToolType,
      tab: 0,

      circle: null as L.Circle | null,
      map: null as Map | null,

      selectionProximity: 4,
      pointerMoveThreshold: 6,
      isPointerMoving: false,
      pointerStartPosition: null as { x: number; y: number } | null,
      lastClosePt: null as PointData | null
    };
  },

  mounted() {

    this.waitForReady().then(async () => {

      // Unlike the other things we're hacking here,
      // we aren't overwriting a method on a singleton instance (WWTControl)
      // or a static method (Constellations, Grids)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      SpreadSheetLayer.prototype.draw = drawSpreadSheetLayer;

      this.setClockSync(false);

      this.imagesetFolder = await this.loadImageCollection({
        url: this.wtml.gammaraypulsar,
        loadChildFolders: false
      });
      const children = this.imagesetFolder.get_children() ?? [];
      
      const layerPromises: Promise<Layer>[] = [];
      children.forEach((item) => {
        if (!(item instanceof Place)) { return; }
        const imageset = item.get_backgroundImageset() ?? item.get_studyImageset();
        if (imageset == null) { return; }
        const name = imageset.get_name();
        layerPromises.push(this.addImageSetLayer({
          url: imageset.get_url(),
          mode: "autodetect",
          name: name,
          goto: false
        }).then((layer) => {
          this.imagesetLayers[name] = layer;
          applyImageSetLayerSetting(layer, ["opacity", 0]);
          return layer;
        }));
      });
      
      this.loadImageCollection({
        url: this.bgWtml,
        loadChildFolders: true,
      }).then((_folder) => {
        this.curForegroundImagesetName = this.fgName;
        this.foregroundOpacity = 0;
        this.backgroundImagesets.unshift(
          new BackgroundImageset("Fermi LAT 8-Year (Gamma Ray)", "Fermi LAT 8-year (gamma)")
        );

        tween(0, 50, (value) => { this.foregroundOpacity = value; }, {
          time: 7500,
          //ease: (t: number) => t * (2 * (1 - t) * 1.75 + t * 0.5),
          //done: () => { this.foregroundOpacity = 50; }
        });
      });
      

      this.loadImageCollection({
        url: this.bgWtml,
        loadChildFolders: true,
      });
      
      this.backgroundImagesets = [...skyBackgroundImagesets];
      
      this.createTableLayer({
        name: "Young Radio Quiet Pulsars",
        referenceFrame: "Sky",
        dataCsv: youngRadioQuietPulsarString
      }).then((layer) => {
        layer.set_lngColumn(1);
        layer.set_latColumn(2);
        layer.set_markerScale(MarkerScales.screen);
        this.applyTableLayerSettings({
          id: layer.id.toString(),
          settings: [
            ["scaleFactor", 45],
            ["plotType", PlotTypes.circle],
            ["color", Color.fromHex(this.color0)],
            //["sizeColumn", 4],
            //["pointScaleType", PointScaleTypes.log],
            ["opacity", 1.0]
          ]
        });
        this.yrqpLayer = layer;
      });
      
      this.createTableLayer({
        name: "Young Radio Loud Pulsars",
        referenceFrame: "Sky",
        dataCsv: youngRadioLoudPulsarString
      }).then((layer) => {
        layer.set_lngColumn(1);
        layer.set_latColumn(2);
        layer.set_markerScale(MarkerScales.screen);
        this.applyTableLayerSettings({
          id: layer.id.toString(),
          settings: [
            ["scaleFactor", 45],
            ["plotType", PlotTypes.circle],
            ["color", Color.fromHex(this.color1)],
            //["sizeColumn", 4],
            //["pointScaleType", PointScaleTypes.log],
            ["opacity", 1.0]
          ]
        });
        this.yrlpLayer = layer;
      });
      
      this.createTableLayer({
        name: "Isolated Millisecond Pulsars",
        referenceFrame: "Sky",
        dataCsv: isolatedMillisecondPulsarString
      }).then((layer) => {
        layer.set_lngColumn(1);
        layer.set_latColumn(2);
        layer.set_markerScale(MarkerScales.screen);
        this.applyTableLayerSettings({
          id: layer.id.toString(),
          settings: [
            ["scaleFactor", 45],
            ["plotType", PlotTypes.circle],
            ["color", Color.fromHex(this.color2)],
            //["sizeColumn", 4],
            //["pointScaleType", PointScaleTypes.log],
            ["opacity", 1.0]
          ]
        });
        this.impLayer = layer;
      });
      
      this.createTableLayer({
        name: "Binary Millisecond Pulsars",
        referenceFrame: "Sky",
        dataCsv: binaryMillisecondPulsarString
      }).then((layer) => {
        layer.set_lngColumn(1);
        layer.set_latColumn(2);
        layer.set_markerScale(MarkerScales.screen);
        this.applyTableLayerSettings({
          id: layer.id.toString(),
          settings: [
            ["scaleFactor", 45],
            ["plotType", PlotTypes.circle],
            ["color", Color.fromHex(this.color3)],
            //["sizeColumn", 4],
            //["pointScaleType", PointScaleTypes.log],
            ["opacity", 1.0]
          ]
        });
        this.bmpLayer = layer;
      });
      
      this.createTableLayer({
        name: "Black Widow System",
        referenceFrame: "Sky",
        dataCsv: blackWidowSystemString
      }).then((layer) => {
        layer.set_lngColumn(1);
        layer.set_latColumn(2);
        layer.set_markerScale(MarkerScales.screen);
        this.applyTableLayerSettings({
          id: layer.id.toString(),
          settings: [
            ["scaleFactor", 45],
            ["plotType", PlotTypes.circle],
            ["color", Color.fromHex(this.color4)],
            //["sizeColumn", 4],
            //["pointScaleType", PointScaleTypes.log],
            ["opacity", 1.0]
          ]
        });
        this.bwsLayer = layer;
      });
      
      this.createTableLayer({
        name: "Redback System",
        referenceFrame: "Sky",
        dataCsv: redbackSystemString
      }).then((layer) => {
        layer.set_lngColumn(1);
        layer.set_latColumn(2);
        layer.set_markerScale(MarkerScales.screen);
        this.applyTableLayerSettings({
          id: layer.id.toString(),
          settings: [
            ["scaleFactor", 45],
            ["plotType", PlotTypes.circle],
            ["color", Color.fromHex(this.color5)],
            //["sizeColumn", 4],
            //["pointScaleType", PointScaleTypes.log],
            ["opacity", 1.0]
          ]
        });
        this.rsLayer = layer;
      });

      this.showControls = !this.mobile;
      
      this.loadImageCollection({
        url: this.bgWtml,
        loadChildFolders: true,
      }).then((folder) => {
        this.curForegroundImagesetName = this.fgName;
        this.backgroundImagesets.unshift(
          new BackgroundImageset("Fermi LAT 8-Year (Gamma Ray)", "Fermi LAT 8-year (gamma)")
        );
      });
      
      Promise.all(layerPromises).then(() => {
        this.layersLoaded = true;
        
        // Set all of the imageset layers to be above the spreadsheet layers
        //this.resetImagesetLayerOrder();

        const splashScreenListener = (_event: KeyboardEvent) => {
          this.showSplashScreen = false;
          window.removeEventListener('keyup', splashScreenListener);
        };
        window.addEventListener('keyup', splashScreenListener);

        window.addEventListener('keyup', (event: KeyboardEvent) => {
          if (["Esc", "Escape"].includes(event.key) && this.showVideoSheet) {
            this.showVideoSheet = false;
          }
        });
      });
      
      this.loadImageCollection({
        url: this.bgWtml,
        loadChildFolders: true,
      }).then((_folder) => {
        this.curBackgroundImagesetName = this.bgName;
        this.backgroundImagesets.unshift(
          new BackgroundImageset("NASA Deep Star Maps (Optical)", "Deep Star Maps 2020")
        );
      });

      this.wwtSettings.set_localHorizonMode(true);
      this.wwtSettings.set_showAltAzGrid(this.showAltAzGrid);
      this.wwtSettings.set_showAltAzGridText(this.showAltAzGrid);
      this.wwtSettings.set_showConstellationLabels(this.showConstellations);
      this.wwtSettings.set_showConstellationFigures(this.showConstellations);

      // This is kinda horrible, but it works!

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.wwtControl._drawSkyOverlays = drawSkyOverlays;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      Constellations.initializeConstellationNames = initializeConstellationNames;
      Grids._makeAltAzGridText = makeAltAzGridText;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      LayerManager._draw = layerManagerDraw;

      // wwtZoomDeg is still 0 if we run this here
      // and it was the same in nextTick
      // so give just a bit of a delay
      setTimeout(() => {
        this.positionSet = true;
      }, 100);

    });

  },

  computed: {
    
    crossfadeOpacity: {
      get(): number {
        return this.cfOpacity;
      },
      set(o: number) {
        if (this.layers.gammafermi) {
          applyImageSetLayerSetting(this.layers.gammafermi, ["opacity", 0.01 * o]);
        }
        this.cfOpacity = o;
      }
    },

    
    isLoading(): boolean {
      return !this.ready;
    },
    ready(): boolean {
      return this.layersLoaded && this.positionSet;
    },
    smallSize(): boolean {
      return this.$vuetify.display.smAndDown;
    },
    mobile(): boolean {
      return this.smallSize && this.touchscreen;
    },
    cssVars() {
      return {
        '--color-default': this.colorD,
        '--color-default2': this.colorRed,
        '--color0':this.color0,
        '--color1':this.color1,
        '--color2':this.color2,
        '--color3':this.color3,
        '--color4':this.color4,
        '--color5':this.color5,
        '--app-content-height': this.showTextSheet ? '66%' : '100%',
      };
    },
    popoverCssVars() {
      const x = this.lastClosePt?.x ?? 0;
      const y = this.lastClosePt?.y ?? 0;

      // Note that the canvas takes up the full width
      const leftPct = 100 * x / window.innerWidth;
      const topPct = 100 * (y - 50) / window.innerHeight;
      return {
        '--current-color': this.lastClosePt?.color.toString() ?? "white",
        '--current-left': `${leftPct}%`,
        '--current-top': `${topPct}%`
      };
    },
    wwtControl(): WWTControl {
      return WWTControl.singleton;
    },
    wwtRenderContext(): RenderContext {
      return this.wwtControl.renderContext;
    },
    wwtSettings(): Settings {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return Settings.get_active();
    },
 
    
    showTextSheet: {
      get(): boolean {
        return this.sheet === 'text';
      },
      set(_value: boolean) {
        this.selectSheet('text');
        this.showTextTooltip = false;
      }
    },
    showVideoSheet: {
      get(): boolean {
        return this.sheet === "video";
      },
      set(value: boolean) {
        this.selectSheet('video');
        if (!value) {
          const video = document.querySelector("#info-video") as HTMLVideoElement;
          video.pause();
        }
        this.showVideoTooltip = false;
      }
    },
    
    curBackgroundImagesetName: {
      get(): string {
        if (this.wwtBackgroundImageset == null) return "";
        return this.wwtBackgroundImageset.get_name();
      },
      set(name: string) {
        this.setBackgroundImageByName(name);
      }
    },
    
    curForegroundImagesetName: {
      get(): string {
        if (this.wwtForegroundImageset == null) return "";
        return this.wwtForegroundImageset.get_name();
      },
      set(name: string) {
        this.setForegroundImageByName(name);
      }
    },
    
    foregroundOpacity: {
      get(): number {
        return this.wwtForegroundOpacity;
      },
      set(o: number) {
        this.setForegroundOpacity(o); 
      }
    },
  },

  methods: {

    // JC: When the "allow imagesets above spreadsheets" functionality
    // gets added into the engine,
    // remember to add something like this along with it
    setSpreadSheetLayerOrder(id: string, order: number) {
      const layer = LayerManager.get_layerList()[id];
      const layers = LayerManager.get_allMaps()[layer.get_referenceFrame()].layers;
      if (order >= 0) {
        const currentIndex = layers.indexOf(layer);
        if (currentIndex > -1) {
          layers.splice(currentIndex, 1);
        }
        LayerManager.get_allMaps()[layer.get_referenceFrame()].layers.splice(order, 0, layer);
      }
    },


    closeSplashScreen() {
      this.showSplashScreen = false;
    },

    selectSheet(name: SheetType) {
      if (this.sheet == name) {
        this.sheet = null;
      } else {
        this.sheet = name;
      }
    },

    getImageSetLayerIndex(layer: ImageSetLayer): number {
      // find layer in this.wwtActiveLayers
      // this.wwtActiveLayers is a dictionary of {0:id1, 1:id2, 2:id3, ...}
      // get the key item with the value of layer.id
      for (const [key, value] of Object.entries(this.wwtActiveLayers)) {
        if (value === layer.id.toString()) {
          return Number(key);
        }
      }
      return -1;
    },

    closestInView(
      point: { x: number, y: number },
      threshold?: number
    ): PointData | null {

      let minDist = Infinity;
      let closestPt: PointData | null = null;

      const rowSeparator = "\r\n";
      const colSeparator = "\t";

      const raDecDeg = this.findRADecForScreenPoint(point);
      const target = { ra: D2R * raDecDeg.ra, dec: D2R * raDecDeg.dec };

      const layers = [this.yrlpLayer, this.yrqpLayer, this.impLayer, this.bmpLayer, this.bwsLayer, this.rsLayer];
      for (const layer of layers) {
        if (layer == null || layer.get_opacity() === 0) {
          continue;
        }

        const inView = layer.getTableDataInView();
        const rows = inView.split(rowSeparator);
        const header = rows.shift();
        if (!header) {
          continue;
        }

        const lngCol = layer.get_lngColumn();
        const latCol = layer.get_latColumn();
        const nameCol = 0;  // All of the data sets have the name in the first column

        for (const row of rows) {
          const values = row.split(colSeparator);
          const ra = D2R * Number(values[lngCol]);
          const dec = D2R * Number(values[latCol]);
          const pt = { ra: ra, dec: dec };
          const dist = distance(target.ra, target.dec, pt.ra, pt.dec);
          if (dist < minDist) {
            closestPt = {
              ...point,
              ra: ra,
              dec: dec,
              name: values[nameCol],
              color: layer.get_color()
            };
            minDist = dist;
          }
        }
      }

      if (closestPt !== null) {
        const closestRADecDeg = { ra: closestPt.ra * R2D, dec: closestPt.dec * R2D };
        const closestScreenPoint = this.findScreenPointForRADec(closestRADecDeg);
        const pixelDist = Math.sqrt((point.x - closestScreenPoint.x) ** 2 + (point.y - closestScreenPoint.y) ** 2);
        if (!threshold || pixelDist < threshold) {
          return closestPt;
        }
      }
      return null;

    },

    wwtOnPointerMove(event: PointerEvent) {
      if (!this.isPointerMoving && this.pointerStartPosition !== null) {
        const dist = Math.sqrt((event.pageX - this.pointerStartPosition.x) ** 2 + (event.pageY - this.pointerStartPosition.y) ** 2);
        if (dist > this.pointerMoveThreshold) {
          this.isPointerMoving = true;
        }
      }
      this.updateLastClosePoint(event);
    },

    wwtOnPointerDown(event: PointerEvent) {
      this.isPointerMoving = false;
      this.pointerStartPosition = { x: event.pageX, y: event.pageY };
    },

    wwtOnPointerUp(event: PointerEvent) {
      if (!this.isPointerMoving) {
        this.updateLastClosePoint(event);
      }

      this.pointerStartPosition = null;
      this.isPointerMoving = false;
    },

    updateLastClosePoint(event: PointerEvent): void {
      const pt = { x: event.offsetX, y: event.offsetY };
      const closestPt = this.closestInView(pt, this.selectionProximity);
      if (closestPt == null && this.lastClosePt == null) {
        return;
      }
      const needsUpdate =
        closestPt == null ||
        this.lastClosePt == null ||
        this.lastClosePt.ra != closestPt.ra ||
        this.lastClosePt.dec != closestPt.dec;
      if (needsUpdate) {
        this.lastClosePt = closestPt;
      }
    },

    wwtSmallestFov(): number {
      // ignore the possibility of rotation
      const w = this.wwtRenderContext.width;
      const h = this.wwtRenderContext.height;
      const fovH = this.wwtRenderContext.get_fovAngle() * D2R;
      const fovW = fovH * w / h;
      return Math.min(fovW, fovH);
    },
    
    circleForLocation(latDeg: number, lonDeg: number): L.Circle<any> {
      return L.circle([latDeg, lonDeg], {
        color: "#FF0000",
        fillColor: "#FF0033",
        fillOpacity: 0.5,
        radius: 200
      });
    },


    // WWT does have all of this functionality built in
    // but it doesn't seem to be exposed
    // We should do that, but for now we just copy the web engine code
    // https://github.com/Carifio24/wwt-webgl-engine/blob/master/engine/wwtlib/Coordinates.cs
    altAzToHADec(altRad: number, azRad: number, latRad: number): { ra: number; dec: number; } {
      azRad = Math.PI - azRad;
      if (azRad < 0) {
        azRad += 2 * Math.PI;
      }
      let ra = Math.atan2(Math.sin(azRad), Math.cos(azRad) * Math.sin(latRad) + Math.tan(altRad) * Math.cos(latRad));
      if (ra < 0) {
        ra += 2 * Math.PI;
      }
      const dec = Math.asin(Math.sin(latRad) * Math.sin(altRad) - Math.cos(latRad) * Math.cos(altRad) * Math.cos(azRad));
      return { ra, dec };
    },

    setLayerOpacityForImageSet(name: string, opacity: number, setting_opacity_from_ui=false) {
      const layer = this.imagesetLayers[name];
      if (layer != null) {
        // update the image opacity in the WWT control
        applyImageSetLayerSetting(layer, ['opacity', opacity]);

        // update the value for the slider only if we are not setting the opacity from the UI
        if (!setting_opacity_from_ui) {
          const selector = `#items div.item[title='${name}'] input.opacity-range[type='range']`;
          const el = (document.querySelector(selector) as HTMLInputElement);
          if (el != null) {
            el.value = `${opacity * 100}`;
          }
        }

        const toggleSelector = `#items input[type='checkbox'][title='${name}']`;
        const el2 = (document.querySelector(toggleSelector) as HTMLInputElement);
        // truth table: opacity == 0 and el.checked == false => do nothing
        // truth table: opacity == 0 and el.checked == true => set el.checked = false
        // truth table: opacity > 0 and el.checked == false => set el.checked = true
        // truth table: opacity > 0 and el.checked == true => do nothing
        if (el2 != null) {
          if (opacity == 0 && el2.checked) {
            el2.checked = false;
          } else if (opacity > 0 && !el2.checked) {
            el2.checked = true;
          }
        }
        
      }
    },
    
  },

  watch: {
    showAltAzGrid(show: boolean) {
      this.wwtSettings.set_showAltAzGrid(show);
      this.wwtSettings.set_showAltAzGridText(show);
    },
    showConstellations(show: boolean) {
      this.wwtSettings.set_showConstellationLabels(show);
      this.wwtSettings.set_showConstellationFigures(show);
    },
    yrqp(on: boolean) {
      if (this.yrqpLayer) {
        applySpreadSheetLayerSetting(this.yrqpLayer, ["opacity", on ? 1.0 : 0.0]);
      }
    },
    yrlp(on: boolean) {
      if (this.yrlpLayer) {
        applySpreadSheetLayerSetting(this.yrlpLayer, ["opacity", on ? 1.0 : 0.0]);
      }
    },
    imp(on: boolean) {
      if (this.impLayer) {
        applySpreadSheetLayerSetting(this.impLayer, ["opacity", on ? 1.0 : 0.0]);
      }
    },
    bmp(on: boolean) {
      if (this.bmpLayer) {
        applySpreadSheetLayerSetting(this.bmpLayer, ["opacity", on ? 1.0 : 0.0]);
      }
    },
    bws(on: boolean) {
      if (this.bwsLayer) {
        applySpreadSheetLayerSetting(this.bwsLayer, ["opacity", on ? 1.0 : 0.0]);
      }
    },    
    rs(on: boolean) {
      if (this.rsLayer) {
        applySpreadSheetLayerSetting(this.rsLayer, ["opacity", on ? 1.0 : 0.0]);
      }
    }    
  }
});

</script>

<style lang="less" scoped>
html {
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: #000;
  overflow: hidden;

  ::-webkit-scrollbar {
    // display: none;
  }
  
  -ms-overflow-style: none;
  // scrollbar-width: none;
}

body {
  position: fixed;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;

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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.modal {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  z-index: 100;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}

#modal-loading {
  background-color: #000;
  .container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    .spinner {
      background-image: url("../../assets/lunar_loader.gif");
      background-repeat: no-repeat;
      background-size: contain;
      width: 3rem;
      height: 3rem;
    }
    p {
      margin: 0 0 0 1rem;
      padding: 0;
      font-size: 150%;
    }
  }
}

.pointer {
  cursor: pointer;
}

.control-icon {
  pointer-events: auto;

  &:hover {
    cursor: pointer;
  }

  &:focus {
    color: white;
  }
}

.control-icon-wrapper {
  color: var(--color-default);
  background: #040404;
  padding: 8px 16px;
  border: 1px solid var(--color-default);
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: auto;

  &:hover {
    cursor: pointer;
  }

  &:focus {
    color: white;
    border-color: white;
  }
}

#close-popover {
  background-color: black;
  color: var(--current-color);
  border: solid 1px var(--current-color);
  border-radius: 7px;
  position: relative;
  left: var(--current-left);
  top: var(--current-top);
  width: fit-content;
  padding: 5px;
}

#video-icon-dummy {
  pointer-events: none;
  visibility: hidden;
}

.top-content {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: calc(100% - 2rem);
  pointer-events: none;
  display: flex;
  justify-content: end;
  align-items: flex-start;
}

.bottom-content {
  display: flex;
  flex-direction: row;
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  width: calc(100% - 1rem);
  pointer-events: none;
  align-items: center;
  gap: 5px;
}

.data-label {
  color: var(--color-default2);
}

.constellations /deep/ label {
    color: var(--color-default2);
}

.radio-quiet /deep/ label {
    color: var(--color0);
}

.radio-loud /deep/ label {
    color: var(--color1);
}

.isolated /deep/ label {
    color: var(--color2);
}

.binary /deep/ label {
    color: var(--color3);
}

.black-widow /deep/ label {
    color: var(--color4);
}

.redback /deep/ label {
    color: var(--color5);
}

.spyder-sys /deep/ {
    justify-content: right;
}

#tools {
  z-index: 10;
  color: #fff;
  width: 100%;

  .opacity-range {
    width: 50vw;
  }

  .clickable {
    cursor: pointer;
  }

  select {
    background: white;
    color: black;
    border-radius: 3px;
  }
}

.opacity-range {
  pointer-events: auto;
  width: 95%;
  align-items: center;

}


.tool-container {
  display: flex;
  width: 99%;
  flex-direction: row;
  align-items: center;
  gap: 5px;
  pointer-events: auto;
}

.folder-view {
  max-height: calc(100% - 150px);
  width: ~"min(160px, 35vw)";
}

#controls {
  background: black;
  padding: 10px;
  border-radius: 10px;
  border: solid 1px var(--color-default2);
  display: flex;
  flex-direction: column;
  align-self: flex-end;
  margin-right: 1rem;
  margin-bottom: 1rem;
  pointer-events: auto;

  .v-label {
    color: var(--color-default2);
    opacity: 1;
  }

  .controls-content {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;

    .v-btn {
      align-self: center;
      padding-left: 5px;
      padding-right: 5px;
      border: solid 1px #899499;

      &:focus {
        border: 2px solid white;
      }
    }

    .v-btn__content {
      color: black;
      font-weight: 900;
      font-size: 0.75em;
      white-space: break-spaces;
      width: 150px;
    }
    
  }

  #controls-top-row {
    display: flex;
    width: 100%;
    flex-direction: row;
    justify-content: flex-end;
  }
}

#show-controls {
  color: var(--color-default);
}

#credits {
  color: #ddd;
  font-size: calc(0.7em + 0.2vw);
  justify-self: flex-end;
  align-self: flex-end;
  display: flex;
  justify-content: center;
  align-items: center;

  p {
    margin: 0;
    padding: 0;
    line-height: 1;
  }

  a {
    text-decoration: none;
    color: #fff;
    pointer-events: auto;

    &:hover {
      text-decoration: underline;
    }

    &[class^="share-network"]:hover {
      text-decoration: none;
      filter: brightness(75%);
    }
  }

  img {
    height: 35px;
    vertical-align: middle;
    margin: 2px;
  }

  @media only screen and (max-width: 600px) {
  img {
    height: 24px;
  }
}

  svg {
    vertical-align: middle;
    height: 24px;
  }
}

.v-selection-control--focus-visible .v-selection-control__input::before {
  opacity: 0.25;
}

.ui-text {
  color: var(--color-default);
  background: black;
  padding: 5px 5px;
  border: 2px solid black;
  border-radius: 10px;
  font-size: calc(0.8em + 0.25vw);
  pointer-events: auto;

  &:focus {
    color: var(--color-default2);
  }
  
  &:hover {
    box-sizing: content-box;
    box-shadow: 0px 0px 6px 0px #45aecb;
    transition: all 200ms ease-out;
  }
}

.slider-label {
  font-weight: bold;
  font-size: calc(0.8em + 0.5vw);
  padding: 5px 10px;
  text-align: center;
  line-height: 20px;

  .light-type {
    font-size: calc(0.56em + 0.35vw);
  }

  &:hover {
    cursor: pointer;
  }
}

.ui-button {
  text-align: center;
  color: var(--color-default);
  background: black;
  padding: 5px 5px;
  border: 2px solid var(--color-default);
  border-radius: 10px;
  font-size: calc(0.7em + 0.2vw);
  user-select: none;
}

.clickable {
  pointer-events: auto;

  &:hover {
    cursor: default;
  }
}

#buttons-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-self: flex-end;
}

#center-view-button {
  margin-bottom: 25px;
}

#right-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.video-wrapper {
  height: 100%;
  background: black;
  text-align: center;
  z-index: 1000;
}

video {
  height: 100%;
  width: auto;
  max-width: 100%;
  object-fit: contain;
}

#video-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  max-width: 100%;
  overflow: hidden;
  padding: 0px;
  z-index: 1000;
}

.bottom-sheet {
  .v-overlay__content {
    align-self: flex-end;
    padding: 0;
    margin: 0;
    max-width: 100%;
    height: 34%;
  }
}

#tabs {
  width: calc(100% - 3em);
  align-self: left;
}

.info-text {
  height: 33vh;
  padding-bottom: 25px;

  & a {
    text-decoration: none;
  }
}

.close-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 15;

  &:hover {
    cursor: pointer;
  }

  &:focus {
    color: white;
    border: 2px solid white;
  }
}

.scrollable {
  overflow-y: auto;
}

#tab-items {
  // padding-bottom: 2px !important;

  .v-card-text {
    font-size: ~"max(14px, calc(0.7em + 0.3vw))";
    padding-top: ~"max(2vw, 16px)";
    padding-left: ~"max(4vw, 16px)";
    padding-right: ~"max(4vw, 16px)";

    .end-spacer {
      height: 25px;
    }
  }

}

#close-text-icon {
  position: absolute;
  top: 0.25em;
  right: calc((3em - 0.6875em) / 3); // font-awesome-icons have width 0.6875em
  color: white;
}

// This prevents the tabs from having some extra space to the left when the screen is small
// (around 400px or less)
.v-tabs:not(.v-tabs--vertical).v-tabs--right>.v-slide-group--is-overflowing.v-tabs-bar--is-mobile:not(.v-slide-group--has-affixes) .v-slide-group__next, .v-tabs:not(.v-tabs--vertical):not(.v-tabs--right)>.v-slide-group--is-overflowing.v-tabs-bar--is-mobile:not(.v-slide-group--has-affixes) .v-slide-group__prev {
  display: none;
}

// Styling the slider

#sliderlabel {
  padding: 5px 10px;
  margin:0 5px;
  color:#fff !important;
  background-color: rgba(214, 4, 147,0.7);
  overflow: visible;
}

#slider {
  width: 100% !important;
  margin: 5px 30px;
}

.vue-slider-process {
  background-color: white !important;
}

.vue-slider-dot-tooltip-inner {
  cursor: grab;
  padding: 4px 10px !important;
  color: white !important;
  background-color: #9A2976 !important;
  border: 1px solid #9A2976 !important;

  &:active {
    cursor: grabbing;
  }
}

.vue-slider-dot-handle {
  cursor: grab;
  background-color: #9A2976 !important;
  border: 1px solid black !important;

  &:active {
    cursor: grabbing;
  }
}

.mark-line {
  position: absolute;
  height: 20px;
  width: 2px;
  margin: 0;
  background-color: var(--color-default);
  transform: translateX(-50%) translateY(calc(-50% + 2px));

}

.left-content {
  position: absolute;
  left: 1rem;
  top: 1rem;
  pointer-events: none;
  height: calc(100% - 2rem);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

@media(max-width: 600px) {
  .mark-line {
    display: none;
  }

  #location-selector {
    width: 80vw;
    height: 85vh;
  }

  #video-container {
    display: inherit;
  }

  #map-container {
    width: 70vw;
  }
}


#splash-overlay {
  position: fixed;
  //  vue components are flex, so we can easy center
  align-items: center;
  justify-content: center;
}


#splash-screen {
  // for some reason the view props don't work
  // for max-width and max-height
  // splash image size 1908 × 2040 px
  max-width: calc(min(90vw,1908px)); 
  max-height: calc(min(90vh,2040px)); 
  /* prevent the image from being stretched */
  object-fit: contain;
}

#splash-close {
  // outline: 1px solid rgba(255, 255, 255, 0.094);
  position: absolute;
  width: 7%;
  height: 8%;
  top: 4%;
  left: 84%;

  &:hover {
    cursor: pointer;
  }
}

#overlays {
  margin: 5px;
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
}

ul.text-list {
  margin-left:1em;
  margin-top: 0.5em;
}

div.credits {
  font-size: 0.8em;
}

// For styling the time picker
// See more info here:
// https://vue3datepicker.com/customization/theming/
.dp__theme_dark {
  --dp-background-color: black !important;
}

.dp__main {
  width: 175px;
}

* {
  --v-input-control-height: 40px;
}

// :root {
//   --map-tiles-filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
// }

// @media (prefers-color-scheme: dark) {
//   .map-tiles {
//     filter:var(--map-tiles-filter, none);
//   }
// }

span.ui-element-ref-comet {
  background-color: #9A2976; /* #04D6B0; */
  padding: 0em 0.1em;
  border-radius: 0.2em;
}

/* from https://www.smashingmagazine.com/2021/12/create-custom-range-input-consistent-browsers/ */
input[type="range"] {
    -webkit-appearance: inherit;
    -moz-appearance: inherit;
    appearance: inherit;
    margin: 2px;
    --track-height: 1em;
    --thumb-radius: 1.5em;
    --thumb-color: rgba(205, 54, 157  , 0.7);
    // --thumb-color: #444;
    --track-color: rgba(4, 147, 214, .1);
    // --thumb-border: 1px solid #899499;
    --thumb-border-width: 1px;
    --thumb-border: var(--thumb-border-width) solid rgb(255, 255, 255);
    --track-border-width: 1px;
    --track-border: var(--track-border-width) solid rgba(4, 147, 214, 1);
    --thumb-margin-top: calc((var(--track-height) - 2*var(--track-border-width)) / 2 - (var(--thumb-radius)) / 2);
    
    &:hover {
      opacity: 1;
      --track-color: rgba(217, 234, 242,0.2);
      --thumb-color: rgba(205, 54, 157  , 1);
    }

    &:focus {
      border-radius: calc(var(--track-height) / 2);
    }
  }
  
  
  
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: inherit;
    -moz-appearance: inherit;
    appearance: inherit;
    width: var(--thumb-radius);
    height: var(--thumb-radius);
    margin-top: var(--thumb-margin-top);
    border-radius: 50%;
    background: var(--thumb-color);
    border: var(--thumb-border);
  }
  
  input[type="range"]::-moz-range-thumb {
    -webkit-appearance: inherit;
    -moz-appearance: inherit;
    appearance: inherit;
    width: var(--thumb-radius);
    height: var(--thumb-radius);
    margin-top: var(--thumb-margin-top);
    border-radius: 50%;
    background: var(--thumb-color);
    cursor: pointer;
    border: var(--thumb-border)
  }
  
  input[type="range"]::-webkit-slider-runnable-track {
    background: var(--track-color);
    /* outline: 1px solid white; */
    border-radius: calc(var(--track-height) / 2);
    border: var(--track-border);
    height: var(--track-height);
    margin-top: 0;
    padding: 0 calc((var(--track-height) - var(--thumb-radius))/2);
  }
  
  
input[type="range"]::-moz-range-track {
    background: var(--track-color);
    /* outline: 1px solid white; */
    border-radius: calc(var(--track-height) / 2);
    border: var(--track-border);
    height:var(--track-height);
    margin-top: 0;
    padding: 0 calc((var(--track-height) - var(--thumb-radius))/2);
  }
</style>
