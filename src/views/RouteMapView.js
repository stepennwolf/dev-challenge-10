import {View} from 'backbone';
import ol from 'openlayers';

const MARKER_SRC = require('../assets/metro-station-icon-small.png');
const SELECTED_MARKER_SRC = require('../assets/metro-station-icon-small-selected.png');


/**
 * Represents Map container
 */
export default View.extend({

  className: "kiev-map",

  initialize() {
    this.listenTo(this.model.get('coordinateList'), 'change:selected', this._onSelectMarkers);
  },



  /**
   * Build marker list according to an appropriate model
   */
  _buildMarkerLayer() {
    const vectorSource = this.model.get('coordinateList').reduce((result, coordItem) => {
      const {label, location: {lat, lng}} = coordItem.toJSON();

      let iconFeature = new ol.Feature({
        name: label,
        geometry: new ol.geom.Point(ol.proj.transform([lng, lat], 'EPSG:4326', 'EPSG:3857'))
      });

      result.addFeature(iconFeature);

      return result;
    }, new ol.source.Vector);

    const iconStyle = new ol.style.Style({
        image: new ol.style.Icon({
        //anchor: [0.5, 46],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        opacity: 0.9,
        src: MARKER_SRC
      })
    });

    return new ol.layer.Vector({
      source: vectorSource,
      style: iconStyle
    });
  },



  selectMarkers() {
    const coordList = this.model.get('coordinateList');

    this.mapControl.getLayers().item(1).getSource().getFeatures().forEach((feature, i) => {
      const coordItem = coordList.at(i);

      if (coordItem.get('selected')) {
        feature.setStyle(new ol.style.Style({
          image: new ol.style.Icon({
            anchorXUnits: 'fraction',
            anchorYUnits: 'pixels',
            src: SELECTED_MARKER_SRC
          })
        }));
      } else if (feature.getStyle() !== null) {
        feature.setStyle(null);
      }
    });
  },



  render(mountNode, options){
    const element = this.el;

    // mount view element into DOM
    mountNode.appendChild(element);

    // Instanciate a Map, set the object target to the map DOM id
    this.mapControl = new ol.Map({
      target: element,

      layers: [
        new ol.layer.Tile({ source: new ol.source.OSM() }),
        this._buildMarkerLayer()
      ],

      view: new ol.View({
        center: ol.proj.transform(options.mapCoord, 'EPSG:4326', 'EPSG:3857'),
        zoom: options.zoom,
        minZoom: options.minZoom,
        maxZoom: options.maxZoom
      })
    });

    return this;
  },



  _onSelectMarkers() {
    this.selectMarkers();
  }
});
