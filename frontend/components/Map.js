import { Component } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export default class Map extends Component {
  constructor(props) {
    super(props);
    this.map = null;
    this.styleSource = props.styleSource;
    this.state = {
      lng: 2.54,
      lat: 46.7,
      zoom: 5,
    };

    if (props.onStyleDataLoaded) {
      this.onStyleDataLoaded = props.onStyleDataLoaded;
    }
  }

  componentDidMount() {
    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: this.styleSource,
      center: [this.state.lng, this.state.lat],
      zoom: this.state.zoom,
      filter: this.props.filter,
    });

    this.map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      })
    );

    this.map.on("styledata", this.onStyleData.bind(this));
    this.map.on("click", this.onMapClick.bind(this));

    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 200);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.styleSource !== this.props.styleSource) {
      this.map.setStyle(this.props.styleSource);
    }

    if (prevProps.filter !== this.props.filter) {
      this.map.setFilter("arbres", this.props.filter);
    }

    this.map.on("styledata", () => {
      this.map.setFilter("arbres", this.props.filter);
    });
  }

  onStyleData() {
    if (this.props.onStyleData) {
      this.props.onStyleData();
    }
  }

  onMapClick(e) {
    const bbox = [
      [e.point.x - 5, e.point.y - 5],
      [e.point.x + 5, e.point.y + 5],
    ];

    var features = this.map.queryRenderedFeatures(bbox, {
      layers: ["arbres"],
    });

    if (features.length) {
      const feature = features.pop();
      const genre = feature.properties.genre_latin
        .toLowerCase()
        .replace(" ", "_");

      this.props.onMapClick(genre);
    }
  }

  render() {
    return (
      <div
        ref={(el) => (this.mapContainer = el)}
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    );
  }
}
