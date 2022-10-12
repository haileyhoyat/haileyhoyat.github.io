
// ID of the Google Spreadsheet. Replace this value with your ID.
// const spreadsheetID = "1om0GebfkQRJV8bW7V0rSpfI5jjcgH0TGPmhcUJE4Mng";
const spreadsheet_id = "1om0GebfkQRJV8bW7V0rSpfI5jjcgH0TGPmhcUJE4Mng";
const tab_name = "Form Responses 1"
// A link to a Google Sheets JSON access point
// Make sure it is public or set to Anyone with link can view.
const DATA_SERVICE_URL = "https://opensheet.elk.sh/" + spreadsheet_id + "/" + tab_name;
let info;
let map;

function addMarker(aValue) {
  //console.log(aValue);
  let lat = parseFloat(aValue["Latitude"]);
  let lng = parseFloat(aValue["Longitude"]);
  let type = aValue["Category of place (favorite, lost, memory)"]
  typeLabel = ""
  let latLng;

  if (type == "lost"){
    typeLabel = "L"
  }
  else if (type == "memory"){
    typeLabel = "M"
  }
  else if (type == "favorite"){
    typeLabel = "F"
  }

  if (!isNaN(lat) && !isNaN(lng)) {
    latLng = new google.maps.LatLng(lat, lng);
  }
  if (!latLng) {
    return;
  }
  let marker = new google.maps.Marker({
    animation: google.maps.Animation.DROP,
    map: map,
    position: latLng,
    label: typeLabel  
  });
  google.maps.event.addListener(marker, 'click', function(){
      showInfo(marker, aValue);
  });

  return marker;
}

function showInfo(aMarker, aValue){
  let content = "<h3>"+aValue["Name of place"]+"</h3>";
  content += "<p>Name: "+aValue["Your name"]+"</p>";
  content += "<p>Category of place: "+aValue["Category of place (favorite, lost, memory)"]+"</p>";
  content += "<p>Significance of place: "+aValue["Briefly describe the significance of the place to you. "]+"</p>";
  info.setContent(content);
  info.open(map, aMarker);
}

function initMap() {
  info = new google.maps.InfoWindow();
  map = new google.maps.Map(document.getElementById("map_canvas"), {
    center: new google.maps.LatLng(41.4993, -81.6944),
    zoom: 10,
    maxZoom: 20,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [
          { visibility: "off" }
        ]
      },
      {
        featureType: "road",
        elementType: "labels",
        stylers: [
          { visibility: "off" }
        ]
      },
      {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{visibility: 'off'}]
      },
      {
        featureType: 'road.highway',
        stylers: [{visibility: 'off'}]
      },
      {
        featureType: 'transit',
        stylers: [{visibility: 'off'}]
      },
    ],
  });

  // Perform request
  let request = new XMLHttpRequest();
  request.open('GET', DATA_SERVICE_URL, true);

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      let data = JSON.parse(request.responseText);
      console.log(data);
      let markers = [];
      for (var i = 0; i < data.length; i++) {
        let JSON = data[i]
        markers.push(addMarker(JSON));
        if (i === data.length - 1) {
          let lat = parseFloat(JSON["Latitude"]);
          let lng = parseFloat(JSON["Longitude"]);
          if (!isNaN(lat) && !isNaN(lng)) {
            let latLng = new google.maps.LatLng(lat, lng);
            if (latLng) {
              map.panTo(latLng);
            }
          } 
        }
      }
    } else {
      console.error("Error fetching spreadsheet data.");
    }
  };


  request.onerror = function() {
    console.error("Error fetching spreadsheet data.");
  };

  request.send();
}

// Focus map to the most recently-added pin.
window.addEventListener("load", function () {
  function sendData() {
    let a = document.querySelector('input#location').value;
    const geo = new google.maps.Geocoder();
    geo.geocode({"address" : a }, function(result, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        let lat = result[0].geometry.location.lat();
        let lng = result[0].geometry.location.lng();
  
        if (isNaN(lat) || isNaN(lng)) {
          alert("Something's gone wrong. Try entering a different location for your place.");
          return;
        }
  
        document.querySelector("input#latitude").value = lat;
        document.querySelector("input#longitude").value = lng;

        form.submit();
      } else {
        alert("Something's gone wrong. Try entering a different location for your book.");
      }
    });
  }
 
  // Access the form element...
  var form = document.getElementById("placeForm");

  // ...and take over its submit event.
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    sendData();
  });
});

/** 
 * Set up form autocomplete
 */
let autocomplete = new google.maps.places.Autocomplete(
  /** @type {!HTMLInputElement} */(document.getElementById('location')),
  {types: ['geocode']});
