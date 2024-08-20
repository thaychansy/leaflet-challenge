// Function to create features from the earthquake data
function createFeatures(earthquakeData) {

    // Give each feature a popup describing the place and time of the earthquakes
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<strong>Location: </strong>${feature.properties.place}
        <p><strong>Time: </strong>${new Date(feature.properties.time)}</p>
        <p><strong>Magnitude: </strong>${feature.properties.mag}</p>
        <p><strong>Depth: </strong>${feature.geometry.coordinates[2]} km</p>
        `);
    }

    // Create a GeoJSON layer containing the features array on the Earthquake Data object
    function createCircleMarker(feature, latlng) {
        let options = {
            radius: feature.properties.mag * 5, // Adjust size based on magnitude
            fillColor: chooseColor(feature.geometry.coordinates[2]), // Use depth to choose color
            color: chooseColor(feature.geometry.coordinates[2]), // Use depth to choose color
            weight: 1,
            opacity: 0.8,
            fillOpacity: 0.35
        };
        return L.circleMarker(latlng, options);
    }

    // Create a variable for earthquakes to house latlng, each feature for popup, and circle radius/color/weight/opacity
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: createCircleMarker
    });

    // Send earthquakes layer to the createMap function - will start creating the map and add features
    createMap(earthquakes);
}

// Circles color palette based on depth
function chooseColor(depth) {
    switch(true) {
        case (depth <= 10):
            return "#0071BC"; // Shallow depths in blue
        case (depth <= 30):
            return "#35BC00"; // Medium depths in green
        case (depth <= 50):
            return "#BCBC00"; // Deeper depths in yellow
        case (depth <= 70):
            return "#EE9C00"; // Deeper depths in orange
        case (depth <= 90):
            return "#8B0000"; // Deepest depths in red
        default:
            return "#BC0000"; // Default color 
    }
}

// Create map legend to provide context for map data
let legend = L.control({ position: 'bottomright' });

legend.onAdd = function() {
    var div = L.DomUtil.create('div', 'info legend');
    
    // Apply inline styles directly to the legend
    div.style.backgroundColor = 'white'; // White background
    div.style.border = '2px solid lightgray'; // Light gray
    div.style.borderRadius = '5px'; // Rounded corners
    div.style.padding = '4px'; // Padding inside the box
    div.style.fontSize = '13px'; // Font size
    div.style.boxShadow = '2px 2px 5px rgba(0, 0, 0, 0.6)'; // Shadow effect
    
    var grades = [-10, 10, 30, 50, 70, 90];
    var labels = [];
    var legendInfo = "<h3>Legend</h3>Depth (km)";

    div.innerHTML = legendInfo;

    // Go through each depth item to label and color the legend
    for (var i = 0; i < grades.length; i++) {
        // Add inline styles for each list item
        labels.push('<li style="margin: 0; padding: 5px 0; font-size: 12px;">' +
                    '<span style="display: inline-block; width: 45px; height: 14px; background-color:' +
                    chooseColor(grades[i] + 1) + '; border-radius: 4px;"></span> ' +
                    grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] : '+') + '</li>');
    }

    // Add each label list item to the div under the <ul> tag
    div.innerHTML += "<ul style='list-style-type: none; margin: 0; padding: 0;'>" + labels.join("") + "</ul>";
    
    return div;
};

// Function to create and display the map
function createMap(earthquakes) {
    // Define outdoorsmap and graymap layers
    let outdoorsmap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: '© OpenTopoMap, © OpenStreetMap contributors'
    });

    let graymap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: '© OpenStreetMap contributors',
        className: 'GrayScale'
    });

    // Define a baseMaps object to hold our base layers
    let baseMaps = {
        "Outdoors": outdoorsmap,
        "Grayscale": graymap
    };

    // Create overlay object to hold our overlay layer
    let overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create our map, giving it the outdoorsmpa and earthquakes layers to display on load
    let myMap = L.map("map", {
        center: [39.8282, -98.5795],
        zoom: 4,
        layers: [outdoorsmap, earthquakes]
    });

    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Add legend to the map
    legend.addTo(myMap);
}

// Store our API endpoint as queryURL
var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryURL).then(function(data) {

    // Once we get a response, send the data.features object to the createFeatures function.
    createFeatures(data.features);
});