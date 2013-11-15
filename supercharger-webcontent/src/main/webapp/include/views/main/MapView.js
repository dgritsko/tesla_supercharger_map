//======================================================================================================================
// MapView
//======================================================================================================================

redshiftsoft = createMyNamespace("redshiftsoft");

/**
 * Constructor.
 */
redshiftsoft.MapView = function (initialRangeMeters, initialFillOpacity, initialFillColor, initialBorderOpacity, initialBorderColor) {

    this.radiusMeters = initialRangeMeters;

    this.fillOpacity = initialFillOpacity;
    this.fillColor = initialFillColor;

    this.borderOpacity = initialBorderOpacity;
    this.borderColor = initialBorderColor;

    this.superData = new redshiftsoft.SuperchargerData();

    this.initMap();

    this.contextMenu = new redshiftsoft.MapViewContextMenu(this.googleMap);

    // handle clicks to toggle supercharger circle
    jQuery(document).on('click', '.circle-toggle-trigger', jQuery.proxy(this.handleCircleToggle, this));
    // handle clicks to remove supercharger marker
    jQuery(document).on('click', '.marker-toggle-trigger', jQuery.proxy(this.handleMarkerRemove, this));
    // handle clicks to remove supercharger marker
    jQuery(document).on('click', '.add-supercharger-trigger', jQuery.proxy(this.handleAddCustomMarker, this));

};

/**
 * Constants
 */
redshiftsoft.MapView.INITIAL_LAT = 38.0;
redshiftsoft.MapView.INITIAL_LNG = -90.644;
redshiftsoft.MapView.INITIAL_ZOOM = 5;


/**
 * Initialize map
 */
redshiftsoft.MapView.prototype.initMap = function () {

    var mapOptions = {
        center: new google.maps.LatLng(redshiftsoft.MapView.INITIAL_LAT, redshiftsoft.MapView.INITIAL_LNG),
        zoom: redshiftsoft.MapView.INITIAL_ZOOM,
        mapTypeControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    this.googleMap = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
    this.drawMarkers();
    this.drawCircles();

    google.maps.event.addListener(this.googleMap, 'rightclick', jQuery.proxy(this.handleShowContextMenu, this));
    google.maps.event.addListener(this.googleMap, 'click', jQuery.proxy(this.handleHideContextMenu, this));
};

/**
 * DRAW MARKERS
 */
redshiftsoft.MapView.prototype.drawMarkers = function () {
    for (var i = 0; i < this.superData.size(); i++) {
        var supercharger = this.superData.get(i);
        redshiftsoft.MapView.addMarkerToSupercharger(this.googleMap, supercharger);
    }
};

/**
 *  DRAW CIRCLES
 */
redshiftsoft.MapView.prototype.drawCircles = function () {

    for (var i = 0; i < this.superData.size(); i++) {
        var supercharger = this.superData.get(i);
        var rangeCircleOptions = {
            strokeColor: this.borderColor,
            strokeOpacity: this.borderOpacity,
            strokeWeight: 1,
            fillColor: this.fillColor,
            fillOpacity: this.fillOpacity,
            map: this.googleMap,
            center: supercharger.location,
            radius: this.radiusMeters
        };
        if (supercharger.circle == null) {
            supercharger.circle = new google.maps.Circle(rangeCircleOptions);
        }
        else {
            supercharger.circle.setOptions(rangeCircleOptions);
        }
    }
};


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// getters/setters
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
redshiftsoft.MapView.prototype.setFillColor = function (colorVal) {
    this.fillColor = colorVal;
};
redshiftsoft.MapView.prototype.setFillOpacity = function (newValue) {
    this.fillOpacity = newValue;
};


redshiftsoft.MapView.prototype.setBorderColor = function (colorVal) {
    this.borderColor = colorVal;
};
redshiftsoft.MapView.prototype.setBorderOpacity = function (newValue) {
    this.borderOpacity = newValue;
};
redshiftsoft.MapView.prototype.setRadiusMeters = function (radiusMetersIn) {
    this.radiusMeters = radiusMetersIn;
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Event handlers
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

redshiftsoft.MapView.prototype.handleCircleToggle = function (event) {
    event.preventDefault();
    var link = $(event.target);
    var id = link.attr('href');
    var supercharger = this.superData.getById(id);
    if (supercharger.circle.getVisible()) {
        link.text("circle on");
        supercharger.circle.setVisible(false);
    } else {
        link.text("circle off");
        supercharger.circle.setVisible(true);
    }
};

redshiftsoft.MapView.prototype.handleMarkerRemove = function (event) {
    event.preventDefault();
    var link = $(event.target);
    var id = link.attr('href');
    var supercharger = this.superData.getById(id);
    supercharger.circle.setMap(null);
    supercharger.marker.setMap(null);
    this.superData.removeById(id);
};

redshiftsoft.MapView.prototype.handleShowContextMenu = function (event) {
    this.contextMenu.showContextMenu(event.latLng);
};
redshiftsoft.MapView.prototype.handleHideContextMenu = function (event) {
    this.contextMenu.hide();
};

/**
 * Add a custom marker and range circle to the map.
 */
redshiftsoft.MapView.prototype.handleAddCustomMarker = function (event) {
    var markerInput = $("#new-marker-name-input");
    var markerDialog = $("#new-marker-dialog");
    var mapView = this;


    function handleOK() {
        markerDialog.dialog("close");
        var markerName = markerInput.val();
        markerInput.val("");
        // add marker
        var newCharger = mapView.superData.addSupercharger(markerName, event.latLng);
        redshiftsoft.MapView.addMarkerToSupercharger(mapView.googleMap, newCharger);
        mapView.drawCircles();
        redshiftsoft.MapView.showInfoWindowForMarker.call(newCharger.marker);
    }

    markerDialog.show().dialog(
        {
            width: 400,
            buttons: [
                {
                    text: "OK",
                    click: handleOK
                }
            ]
        }
    );
}


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// CLASS level methods
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


redshiftsoft.MapView.addMarkerToSupercharger = function (googleMap, supercharger) {
    var markerOptions = {
        position: supercharger.location,
        map: googleMap,
        title: supercharger.displayName,
        animation: google.maps.Animation.DROP
    };
    if (supercharger.construction) {
        markerOptions['icon'] = "images/construction-cone-marker.png";
    }
    var marker = new google.maps.Marker(markerOptions);
    supercharger.marker = marker;
    marker.supercharger = supercharger;
    google.maps.event.addListener(supercharger.marker, 'click', redshiftsoft.MapView.showInfoWindowForMarker);
}

redshiftsoft.MapView.showInfoWindowForMarker = function () {
    var myMarker = this;
    var supercharger = myMarker.supercharger;
    var popupContent = "";
    popupContent += "<div class='info-window-content'>";
    popupContent += "<div class='title'>" + supercharger.displayName + "</div>" + "";
    if (supercharger.construction) {
        popupContent += "<div style='color: orange; font-size: smaller; font-weight: bold'>under construction</div>";
    }
    popupContent += supercharger.address.street + "<br/>";
    if (supercharger.url != null) {
        popupContent += "<a target='_blank' href='" + supercharger.url + "'>web page</a>";
        popupContent += "&nbsp;&nbsp;&nbsp;";
    }
    var circleOnOffLabel = (supercharger.circle != null && supercharger.circle.getVisible()) ? "circle off" : "circle on";
    popupContent += "<a class='circle-toggle-trigger' href='" + supercharger.id + "'>" + circleOnOffLabel + "</a>";
    popupContent += "&nbsp;&nbsp;&nbsp;";
    if (supercharger.custom) {
        popupContent += "<a class='marker-toggle-trigger' href='" + supercharger.id + "'>remove</a><br/>";
    }
    popupContent += "</div>";

    var windowOptions = { content: popupContent  };
    var infoWindow = new google.maps.InfoWindow(windowOptions);
    infoWindow.open(myMarker.map, myMarker);
}
