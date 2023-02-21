// Initiate basemap 
var map = L.map('map').setView([47.251, -122.462], 13);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/satellite-streets-v12',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZGFlbGVuZyIsImEiOiJjbDl5d3h6NzkwOTdoM29xb20xYzJ3NmZsIn0.sMhj9jD84igqnZdX08l33A'
}).addTo(map);

// mapbox://styles/daeleng/clai0pzys000015s2otsvi46f
// https://api.mapbox.com/styles/v1/daeleng/clai0pzys000015s2otsvi46f/wmts?access_token=pk.eyJ1IjoiZGFlbGVuZyIsImEiOiJjbDl5d3h6NzkwOTdoM29xb20xYzJ3NmZsIn0.sMhj9jD84igqnZdX08l33A 

// Tells user what this tool is for (coolecting road info) 
alert('This tool is to record Road issues to they can be fixed \ncreate a marker to record the issue:');

// Creates the variable drawItems to store created shapes 
var drawnItems = L.featureGroup().addTo(map);

// This code creates the layer group that takes the data from the SQL table and displays it on the map
// This also sets the SQL variables 
var tableData = L.layerGroup().addTo(map);
var url = "https://178.128.228.240:4000/sql?q=";
// change the Query below by replacing lab_7_name with your table name
var sqlQuery = "SELECT * FROM roadCon";
function addPopup(feature, layer) {
    layer.bindPopup(
        "<b><u> Road hazard details </u></b><br>Road Type: " + feature.properties.rtype + "<br>Road Issue: " +
        feature.properties.rissue + "<br>Road Issue Description: " + feature.properties.description + "<br><b>Submited by: </b>" + feature.properties.name
    );
}

fetch(url + sqlQuery)
    .then(function(response) {
    return response.json();
    })
    .then(function(data) {
        L.geoJSON(data, {onEachFeature: addPopup}).addTo(tableData);
    });

// This uses Leaflet.draw to create shapes 
// CHANGE THIS TO ONLY ACCEPT MARKERS, CHECK
new L.Control.Draw({
    draw : {
        polygon : false,        // polygons disabled
        polyline : false,       // polyline disabled
        rectangle : false,     // Rectangles disabled
        circle : false,        // Circles disabled 
        circlemarker : false,  // Circle markers disabled
        marker: true
    },
    edit : {
        featureGroup: drawnItems
    }
}).addTo(map);



//This event listners adds the layer to the drawItems layerGroup, and uses the function createFormPopup to get information from user
map.addEventListener("draw:created", function(e) {
    e.layer.addTo(drawnItems);
    createFormPopup();
    // remove this later 
    // var geojson = JSON.stringify(layer.toGeoJSON().geometry);
    // console.log(geojson);
});

// This is an event listner that adds the layer created from L.Control.Draw to drawnItems 
// EDIT THIS FORM TO HAVE WHAT YOU NEED FOR ROAD QUALITY SURVEY 
function createFormPopup() {
    var popupContent = 
        '<form>' + 
'            <ul>' + 
'                <b>Type of road:</b> <br>' + 
'                <li>' + 
'                  ' + 
'                    <input type="radio" id="RType" name="RType" value="Asphalt">' + 
'                    Asphalt' + 
'                  ' + 
'                </li>' + 
'                <li>' + 
'                ' + 
'                    <input type="radio" id="RType" name="RType" value="Concrete" >' + 
'                    Concrete' + 
'                 ' + 
'                </li>' + 
'                <li>' + 
'                ' + 
'                    <input type="radio" id="RType" name="RType" value="Dirt">' + 
'                    Dirt' + 
'                ' + 
'                </li>' + 
'            </ul>' + 
'            <br>' + 
'            <ul>' + 
'                <b>Report issue with the road:</b> <br>' + 
'                <li>' + 
'                  ' + 
'                    <input type="radio" id="RIssue" name="RIssue" value="Pot Hole">' + 
'                    Pot Hole' + 
'                  ' + 
'                </li>' + 
'                <li>' + 
'                ' + 
'                    <input type="radio" id="RIssue" name="RIssue" value="icy" >' + 
'                    Icy' + 
'                 ' + 
'                </li>' + 
'                <li>' + 
'                ' + 
'                    <input type="radio" id="RIssue" name="RIssue" value="Damaged Sign">' + 
'                    Damaged Sign' + 
'                ' + 
'                </li>' + 
'                <li>' + 
'                ' + 
'                    <input type="radio" id="RIssue" name="RIssue" value="Slick Road">' + 
'                    Slick Road' + 
'                ' + 
'                </li>' + 
'            </ul>' + 
'            ' + 
'            <br>' + 
'            Description of road issue:<br><input type="text" id="input_desc">' + 
'            <br>' + 
'            User\'s Name:<br><input type="text" id="input_name">' + 
'            <br> ' + 
'            <input type="button" value="Submit" id="submit">  ' + 
'        </form>'
    drawnItems.bindPopup(popupContent).openPopup();
}

// This function will console log the information input in the poup up once submit is clicked, also logs the created GeoJson as a string
function setData(e) {
    if(e.target && e.target.id == "submit") {
        // Get user name and description
        var RoadIssue = document.getElementById("RIssue").value;
        var RoadType = document.getElementById("RType").value;
        var RoadDesc = document.getElementById("input_desc").value;
        var UsersName = document.getElementById("input_name").value;
        
           	// For each drawn layer
        drawnItems.eachLayer(function(layer) {
            
            // Create SQL expression to insert layer
            var drawing = JSON.stringify(layer.toGeoJSON().geometry);
            var sql =
                "INSERT INTO roadCon (geom, rtype, rissue, description, name) " +
                "VALUES (ST_SetSRID(ST_GeomFromGeoJSON('" +
                drawing + "'), 4326), '" +
                RoadType + "', '" + RoadIssue + "', '" + RoadDesc + "', '" +
                UsersName + "');";
            console.log(sql);

            // Send the data
            fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: "q=" + encodeURI(sql)
            })
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                console.log("Data saved:", data);
            })
            .catch(function(error) {
                console.log("Problem saving the data:", error);
            });

        // Transfer submitted drawing to the tableData layer 
        //so it persists on the map without you having to refresh the page
        var newData = layer.toGeoJSON();
        newData.properties.rtype = RoadType
        newData.properties.rissue = RoadIssue
        newData.properties.description = RoadDesc;
        newData.properties.name = UsersName;
        L.geoJSON(newData, {onEachFeature: addPopup}).addTo(tableData);

        });
        
        // Clear drawn items layer
        drawnItems.closePopup();
        drawnItems.clearLayers();
    }
}

// This adds an event listener so taht setData function always goes off if clicked, but there is an if statment in setData to catch if submit is licked 
document.addEventListener("click", setData);

// event listner for if editing starts the pop up will close 
map.addEventListener("draw:editstart", function(e) {
    drawnItems.closePopup();
});
// Listener for if the layer editing delete starts the pop up closes 
map.addEventListener("draw:deletestart", function(e) {
    drawnItems.closePopup();
});
// event listner for if layer editing stops to re-open the pop up 
map.addEventListener("draw:editstop", function(e) {
    drawnItems.openPopup();
});
// map listender for if the delete stops IF the layer still exists, re-open pop up 
map.addEventListener("draw:deletestop", function(e) {
    if(drawnItems.getLayers().length > 0) {
        drawnItems.openPopup();
    }
});