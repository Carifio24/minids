// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

/* eslint-disable */

import {
  Color, Colors, Constellations, Coordinates, Grids,
  LayerManager, LayerMap, Planets, PushPin, RenderContext, Settings, SpaceTimeController,
  SpreadSheetLayer, Text3d, Text3dBatch, URLHelpers,
  Vector3d, WWTControl
} from "@wwtelescope/engine";

export function drawSkyOverlays() {
  if (Settings.get_active().get_showConstellationLabels()) {
    Constellations.drawConstellationNames(this.renderContext, 1, Colors.get_yellow());
  }
  if (Settings.get_active().get_showConstellationFigures()) {
    if (WWTControl.constellationsFigures == null) {
      WWTControl.constellationsFigures = Constellations.create('Constellations', URLHelpers.singleton.engineAssetUrl('figures.txt'), false, false, false);
    }
    WWTControl.constellationsFigures.draw(this.renderContext, false, 'UMA', false);
  }
  if (Settings.get_active().get_showAltAzGrid()) {
    const altAzColor = Color.fromArgb(1, 3, 92, 134);
    Grids.drawAltAzGrid(this.renderContext, 1, altAzColor);
    if (Settings.get_active().get_showAltAzGridText()) {
      Grids.drawAltAzGridText(this.renderContext, 1, altAzColor);
    }
  }
  if (Settings.get_active().get_showEcliptic()) {
    const eclipticColor = Color.fromArgb(1, 255, 165, 0);
    Grids.drawEcliptic(this.renderContext, 1, eclipticColor);
    if (Settings.get_active().get_showEclipticOverviewText()) {
      Grids.drawEclipticText(this.renderContext, 1, eclipticColor);
    }
  }
}

export function initializeConstellationNames() {
  if (Constellations.constellationCentroids == null) {
    return;
  }
  const textSize = 50;
  Constellations._namesBatch = new Text3dBatch(textSize);
  Object.keys(Constellations.constellationCentroids).forEach(key => {
    const centroid = Constellations.constellationCentroids[key];
    const center = Coordinates.raDecTo3dAu(centroid.get_RA(), centroid.get_dec(), 1);
    const up = Vector3d.create(0, 1, 0);
    let name = centroid.get_name();
    if (centroid.get_name() === 'Triangulum Australe') {
      name = name.replace(" ", "\n   ");
    }
    Constellations._namesBatch.add(new Text3d(center, up, name, textSize, 0.000125));
  });
};

export function makeAltAzGridText() {
  if (Grids._altAzTextBatch == null) {
    const glyphHeight = 70;
    Grids._altAzTextBatch = new Text3dBatch(glyphHeight);
    const sign = SpaceTimeController.get_location().get_lat() < 0 ? -1 : 1;
    const alt = 0.03 * sign;
    const up = Vector3d.create(0, sign, 0);
    const directions = [
      [[0, alt, -1], "N"],
      [[-1, alt, 0], "E"],
      [[0, alt, 1], "S"],
      [[1, alt, -0.0095], "V"],
      [[1, alt, 0.0095], "V"]
    ]
    directions.forEach(([v, text]) => {
      Grids._altAzTextBatch.add(new Text3d(Vector3d.create(...v), up, text, 75, 0.00018));
    });
  }
}

export function drawSpreadSheetLayer(renderContext, opacity, flat) {
  var device = renderContext;
  if (this.version !== this.lastVersion) {
    this.cleanUp();
  }
  this.lastVersion = this.version;
  if (this.bufferIsFlat !== flat) {
    this.cleanUp();
    this.bufferIsFlat = flat;
  }
  if (this.dirty) {
    this.prepVertexBuffer(device, opacity);
  }
  var jNow = SpaceTimeController.get_jNow() - SpaceTimeController.utcToJulian(this.baseDate);
  var adjustedScale = this.scaleFactor * 3;
  if (flat && this.astronomical && (this._markerScale$1 === 1)) {
    adjustedScale = (this.scaleFactor / (renderContext.viewCamera.zoom / 360));
  }
  if (this.triangleList2d != null) {
    this.triangleList2d.decay = this.decay;
    this.triangleList2d.sky = this.get_astronomical();
    this.triangleList2d.timeSeries = this.timeSeries;
    this.triangleList2d.jNow = jNow;
    this.triangleList2d.draw(renderContext, opacity * this.get_opacity(), 1);
  }
  if (this.triangleList != null) {
    this.triangleList.decay = this.decay;
    this.triangleList.sky = this.get_astronomical();
    this.triangleList.timeSeries = this.timeSeries;
    this.triangleList.jNow = jNow;
    this.triangleList.draw(renderContext, opacity * this.get_opacity(), 1);
  }
  if (this.pointList != null) {
    this.pointList.depthBuffered = false;
    this.pointList.showFarSide = this.get_showFarSide();
    this.pointList.decay = (this.timeSeries) ? this.decay : 0;
    this.pointList.sky = this.get_astronomical();
    this.pointList.timeSeries = this.timeSeries;
    this.pointList.jNow = jNow;
    this.pointList.scale = (this._markerScale$1 === 1) ? adjustedScale : -adjustedScale;
    switch (this._plotType$1) {
      case 0:
        this.pointList.draw(renderContext, opacity * this.get_opacity(), false);
        break;
      case 2:
        this.pointList.drawTextured(renderContext, SpreadSheetLayer.get__circleTexture$1().texture2d, opacity * this.get_opacity());
        break;
      case 1:
        this.pointList.drawTextured(renderContext, PushPin.getPushPinTexture(19), opacity * this.get_opacity());
        break;
      case 3:
        this.pointList.drawTextured(renderContext, PushPin.getPushPinTexture(35), opacity * this.get_opacity());
        break;
      case 5:
      case 4:
        this.pointList.drawTextured(renderContext, PushPin.getPushPinTexture(this._markerIndex$1), opacity * this.get_opacity());
        break;
      default:
        break;
    }
  }
  if (this.lineList != null) {
    this.lineList.sky = this.get_astronomical();
    this.lineList.decay = this.decay;
    this.lineList.timeSeries = this.timeSeries;
    this.lineList.jNow = jNow;
    this.lineList.drawLines(renderContext, opacity * this.get_opacity());
  }
  if (this.lineList2d != null) {
    this.lineList2d.sky = this.get_astronomical();
    this.lineList2d.decay = this.decay;
    this.lineList2d.timeSeries = this.timeSeries;
    this.lineList2d.showFarSide = this.get_showFarSide();
    this.lineList2d.jNow = jNow;
    this.lineList2d.drawLines(renderContext, opacity * this.get_opacity());
  }
  return true;
}

export function layerManagerDraw(renderContext, opacity, astronomical, referenceFrame, nested, cosmos) {
  if (!(referenceFrame in LayerManager.get_allMaps())) {
    return;
  }
  var thisMap = LayerManager.get_allMaps()[referenceFrame];
  if (!thisMap.enabled || (!thisMap.layers.length && !(thisMap.frame.showAsPoint || thisMap.frame.showOrbitPath))) {
    return;
  }
  var matOld = renderContext.get_world();
  var matOldNonRotating = renderContext.get_worldBaseNonRotating();
  var oldNominalRadius = renderContext.get_nominalRadius();
  if ((thisMap.frame.reference === 18 | thisMap.frame.reference === 18) === 1) {
    thisMap.computeFrame(renderContext);
    if (thisMap.frame.referenceFrameType !== 1 && thisMap.frame.referenceFrameType !== 2) {
      renderContext.set_world(Matrix3d.multiplyMatrix(thisMap.frame.worldMatrix, renderContext.get_world()));
    }
    else {
      renderContext.set_world(Matrix3d.multiplyMatrix(thisMap.frame.worldMatrix, renderContext.get_worldBaseNonRotating()));
    }
    renderContext.set_nominalRadius(thisMap.frame.meanRadius);
  }
  //console.log("========");
  for (const layer of LayerManager.get_allMaps()[referenceFrame].layers) {
    if (layer.enabled) {
      //console.log(layer);
      var layerStart = SpaceTimeController.utcToJulian(layer.get_startTime());
      var layerEnd = SpaceTimeController.utcToJulian(layer.get_endTime());
      var fadeIn = SpaceTimeController.utcToJulian(layer.get_startTime()) - ((layer.get_fadeType() === 1 || layer.get_fadeType() === 3) ? (layer.get_fadeSpan() / 864000000) : 0);
      var fadeOut = SpaceTimeController.utcToJulian(layer.get_endTime()) + ((layer.get_fadeType() === 2 || layer.get_fadeType() === 3) ? (layer.get_fadeSpan() / 864000000) : 0);
      if (SpaceTimeController.get_jNow() > fadeIn && SpaceTimeController.get_jNow() < fadeOut) {
        var fadeOpacity = 1;
        if (SpaceTimeController.get_jNow() < layerStart) {
          fadeOpacity = ((SpaceTimeController.get_jNow() - fadeIn) / (layer.get_fadeSpan() / 864000000));
        }
        if (SpaceTimeController.get_jNow() > layerEnd) {
          fadeOpacity = ((fadeOut - SpaceTimeController.get_jNow()) / (layer.get_fadeSpan() / 864000000));
        }
        layer.set_astronomical(astronomical);
        layer.draw(renderContext, opacity * fadeOpacity, cosmos);
      }
    }
  }
  renderContext.set_nominalRadius(oldNominalRadius);
  renderContext.set_world(matOld);
  renderContext.set_worldBaseNonRotating(matOldNonRotating);
};

// This function is being overwritten to get around the bug(?) described in https://github.com/WorldWideTelescope/wwt-webgl-engine/issues/268
// Since we were patching anyway, I've stripped out some if-else paths that won't ever be visited in this story
export function updateViewParameters() {
  if (this.renderContext.space && this._tracking && this._trackingObject != null) {
     var currentAltAz = Coordinates.equitorialToHorizon(Coordinates.fromRaDec(this._trackingObject.get_RA(), this._trackingObject.get_dec()), SpaceTimeController.get_location(), SpaceTimeController.get_now());
     this.renderContext.targetAlt = this.renderContext.alt = currentAltAz.get_alt();
     this.renderContext.targetAz = this.renderContext.az = currentAltAz.get_az();
   }
   else if (!this.get_solarSystemMode()) {
     this._tracking = false;
     this._trackingObject = null;
   }
   var oneMinusDragCoefficient = 1 - 0.8;
   var dc = 0.8;
   if (!this._tracking) {
     var minDelta = (this.renderContext.viewCamera.zoom / 4000);
     if (this.renderContext.viewCamera.zoom > 360) {
       minDelta = (360 / 40000);
     }
     if ((((Math.abs(this.renderContext.targetAlt - this.renderContext.alt) >= minDelta) | (Math.abs(this.renderContext.targetAz - this.renderContext.az) >= minDelta)) === 1)) {
       this.renderContext.alt += (this.renderContext.targetAlt - this.renderContext.alt) / 10;
       if (Math.abs(this.renderContext.targetAz - this.renderContext.az) > 170) {
         if (this.renderContext.targetAz > this.renderContext.az) {
           this.renderContext.az += (this.renderContext.targetAz - (360 + this.renderContext.az)) / 10;
         }
         else {
           this.renderContext.az += ((360 + this.renderContext.targetAz) - this.renderContext.az) / 10;
         }
       }
       else {
         this.renderContext.az += (this.renderContext.targetAz - this.renderContext.az) / 10;
       }
       this.renderContext.az = ((this.renderContext.az + 720) % 360);
     }
   }
   this.renderContext.viewCamera.zoom = dc * this.renderContext.viewCamera.zoom + oneMinusDragCoefficient * this.renderContext.targetCamera.zoom;
   this.renderContext.viewCamera.rotation = dc * this.renderContext.viewCamera.rotation + oneMinusDragCoefficient * this.renderContext.targetCamera.rotation;
   this.renderContext.viewCamera.angle = dc * this.renderContext.viewCamera.angle + oneMinusDragCoefficient * this.renderContext.targetCamera.angle;
}

export function drawPlanets(renderContext: RenderContext, opacity: number) {
  if (Planets._planetTextures == null) {
      Planets._loadPlanetTextures();
    }
    var elong = Planets._geocentricElongation(Planets._planetLocations[9].RA, Planets._planetLocations[9].dec, Planets._planetLocations[0].RA, Planets._planetLocations[0].dec);
    var raDif = Planets._planetLocations[9].RA - Planets._planetLocations[0].RA;
    if (Planets._planetLocations[9].RA < Planets._planetLocations[0].RA) {
      raDif += 24;
    }
    var phaseAngle = Planets._phaseAngle(elong, Planets._planetLocations[9].distance, Planets._planetLocations[0].distance);
    var limbAngle = Planets._positionAngle(Planets._planetLocations[9].RA, Planets._planetLocations[9].dec, Planets._planetLocations[0].RA, Planets._planetLocations[0].dec);
    if (raDif < 12) {
      phaseAngle += 180;
    }
    var dista = (Math.abs(Planets._planetLocations[9].RA - Planets._planetLocations[0].RA) * 15) * Math.cos(Coordinates.degreesToRadians(Planets._planetLocations[0].dec));
    var distb = Math.abs(Planets._planetLocations[9].dec - Planets._planetLocations[0].dec);
    var sunMoonDist = Math.sqrt(dista * dista + distb * distb);
    var eclipse = false;
    var coronaOpacity = 0;
    var moonEffect = (Planets._planetScales[9] / 2 - sunMoonDist);
    var darkLimb = Math.min(32, sunMoonDist * 32);
    if (moonEffect > (Planets._planetScales[0] / 4)) {
      eclipse = true;
      coronaOpacity = Math.min(1, (moonEffect - (Planets._planetScales[0] / 2)) / 0.001);
      Planets._drawPlanet(renderContext, 18, coronaOpacity);
    }
    for (const key in Planets._planetDrawOrder) {
      var planetId = Planets._planetDrawOrder[key];
      // 0: Sun, 9: Moon, 19: Earth
      if ([0, 9, 19].includes(planetId)) {
        Planets._drawPlanet(renderContext, planetId, 1);
      }
    }
    return true;
}
