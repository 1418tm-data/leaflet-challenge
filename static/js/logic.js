// Store our plates JSON inside platesUrl
var platesUrl = "/static/data/PB2002_plates.json";

// Perform a GET request to the query URL

// Store our earthquake JSON inside earthquakeUrl
var earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Perform a GET request to the query URL
d3.json(earthquakeUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

  // Create a function to get the different colors
function getColor(mag){
    if (mag > 5)
        return "#f06b6b"
    else if (mag > 4)
        return "#f0a76b"
    else if (mag > 3)
        return "#f3ba4d"
    else if (mag > 2)
        return "#f3db4d"
    else if (mag > 1)
        return "#e1f34d"
    else
        return "#b7f34d"

}

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p> Magnitude: " + feature.properties.mag);
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng);
    },
    style: function(feature) {
        return{
            fillColor:getColor(feature.properties.mag),
            fillOpacity:1,
            radius:feature.properties.mag*7,
            color:"black",
            weight:0.3       
        
        }        
    }
  });

  d3.json(platesUrl, function(plates) {
    // Once we get a response, send the plates.features object to the createPlatesFeatures function
    createPlatesFeatures(plates.features);
  });
  
  function createPlatesFeatures(platesData) {  
    
      var plates = L.geoJSON(platesData, {
        //   onEachPlatesFeature: onEachPlatesFeature,
          style: function(feature) {
              return{
                  fillColor:"white",
                  fillOpacity:0,                
                  color:"orange",
                  weight: 1                
              }        
          }
        });        
  
  // Sending our layers to the createMap function
  createMap(plates, earthquakes);
   }
}

function createMap(plates, earthquakes) {

  // Define Satellite, Outdoors and Grayscale layers
   var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 25,
    id: "satellite-streets-v10",
    accessToken: API_KEY
  });

  var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 25,
    id: "outdoors-v10",
    accessToken: API_KEY
  });

  var grayscale = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' + 'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>', 
      id: 'mapbox/light-v10',
      tileSize: 512, 
      zoomOffset: -1,
      maxZoom: 25,
      accessToken: API_KEY 
      
    });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Satellite": satellite,
    "Grayscale": grayscale,      
    "Outdoors": outdoors      
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    "Fault Lines": plates
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      39.32, -111.09
    ],
    zoom: 3,
    layers: [satellite, earthquakes, plates]
  });


  var legend = L.control({position: 'bottomright'});
  legend.onAdd = function (map) {  
      var div = L.DomUtil.create('div', 'info legend'),
          magnitude = [0, 1, 2, 3, 4, 5],
          colors = ["#b7f34d", "#e1f34d", "#f3db4d", "#f3ba4d", "#f0a76b", "#f06b6b"]          
  
      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < magnitude.length; i++) {
          div.innerHTML +=
              '<i style="background:' + colors[i] + '"></i> ' +
              magnitude[i] + (magnitude[i + 1] ? '&ndash;' + magnitude[i + 1] + '<br>' : '+');
      }  
      return div;
  };
  
  legend.addTo(myMap);

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
}
