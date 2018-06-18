function basegooglemap(widget_id, url, skin, parameters)
{
  // Will be using "self" throughout for the various flavors of "this"
  // so for consistency ...
   
  self = this
  
  // Initialization
  
  self.widget_id = widget_id
  
  // Parameters may come in useful later on
  
  self.parameters = parameters
  
  // Define callbacks for on click events
  // They are defined as functions below and can be any name as long as the
  // 'self'variables match the callbacks array below
  // We need to add them into the object for later reference
 
  var callbacks = []        
   
  // Define callbacks for entities - this model allows a widget to monitor multiple entities if needed
  // Initial will be called when the dashboard loads and state has been gathered for the entity
  // Update will be called every time an update occurs for that entity
   
  self.OnStateAvailable = OnStateAvailable;
  self.OnStateUpdate = OnStateUpdate;

  // Function Definitions
  
  // The StateAvailable function will be called when 
  // self.state[<entity>] has valid information for the requested entity
  // state is the initial state

  var locations = [];
  var infowindow = [];
  var map;
  var infoopen= false;
 
  if (document.querySelector('html').lang)
    lang = document.querySelector('html').lang;
  else
    lang = 'en';

  var vkey = self.parameters.apikey;

  var x = create_entity_JSON(self);

  var monitored_entities = x
  
  vurl = 'https://maps.googleapis.com/maps/api/js?signed_in=true&key=' + vkey + '&language=' + lang;
  jQuery.loadScript = function (url, callback) {
    jQuery.ajax({
      url: vurl,
      dataType: 'script',
      success: callback,
      async: true
    }); // end ajax
  }  // end load script

  if (typeof someObject == 'undefined') $.loadScript(vurl, function(){
  // need to get a better solution for this
      LatLng = new google.maps.LatLng(-33.856223,151.2130823);
      var myOptions = {
        zoom: 10,
        center: LatLng,
        mapTypeControlOptions: {
          mapTypeIds: [google.maps.MapTypeId.ROADMAP]
          }, // here´s the array of controls
        disableDefaultUI: false, // a way to quickly hide all controls
        mapTypeControl: false,
        streetViewControl: false,
        scaleControl: false,
        zoomControl: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
 
      map = new google.maps.Map(document.getElementById(widget_id).querySelector("#map"),myOptions);
//      infowindow = new google.maps.InfoWindow;

      setTimeout(SetMarkers(),500);
  });  

  // Finally, call the parent constructor to get things moving
  
  WidgetBase.call(self, widget_id, url, skin, parameters, monitored_entities, callbacks)  

  function create_entity_JSON(self) {
    // build the monitored entity JSON
    // [{"entity": self.parameters.entity, "initial": self.OnStateAvailable, "update": self.OnStateUpdate}]
    jsonObj = [];
    p = self.parameters.devices;

    for (var i = 0; i < p.length; i++) {
      item = {};
      item ["entity"] = p[i].device;
      item ["initial"] = self.OnStateAvailable;
      item ["update"] = self.OnStateUpdate;
      jsonObj.push(item);
    }

    p = self.parameters.zones;
    for (var i = 0; i < p.length; i++) {
      item = {};
      item ["entity"] = p[i].zone;
      item ["initial"] = self.OnStateAvailable;
      jsonObj.push(item);
    }
    return jsonObj;
  }  // end create_entity_JSON

  function initiatemap(self,state)
  {
    // create list of monitoring data
    item = {};
    if (state.attributes.latitude === "undefined")
      item ["latlng"] = "";
    else
      item ["latlng"] = {lat: state.attributes.latitude, lng: state.attributes.longitude};
    item ["friendly_name"] = state.attributes.friendly_name;
    item ["icon"] = state.attributes.icon;
    item ["device"] = state.entity_id;
    ventity_id = state.entity_id;
    item ["state"] = state.state;
    item ["tcount"] = "0";
    if (ventity_id.startsWith('device_tracker')) {
      item ["type"] = "tracker";
      var p = self.parameters.devices;
      for (var i = 0; i < p.length; i++) {
        if (state.entity_id == p[i].device) {
          item ["icon"] = p[i].icon;
          break;
        }
      }
    } else {
      item ["type"] = "zone";
      var p = self.parameters.zones;
      for (var j = 0; j < p.length; j++) {
        if (ventity_id == p[j].zone) {
          item ["icon"] = p[j].icon;
          break;
        }
      }
    }
    item ["marker"] = "";
    item ["info"] = "";
    //update is required load the markers
    item ["update"] = true;
    locations.push(item);
  } // end initiatemap

  function SetMarkers() {
    var vimage = ""//'http://maps.google.com/mapfiles/kml/paddle/grn-blank.png';

    infowindow = new google.maps.InfoWindow;
    google.maps.event.addListener(infowindow, "closeclick", function() {
      infowindow.close();
      infoopen = false;
      SetMarkers();
      zoomExtends();
    });   

    for (var i = 0; i < locations.length; i++) {
      // if a device tracker object does not have latlng ignore it
      if (typeof locations[i].latlng.lng === "undefined")
        continue;
      // only update the locations that need it
      if (locations[i].update == true)
        locations[i].update = false;
      else
        continue;
      if (locations[i].marker == "")
        locations[i].marker = new google.maps.Marker({visible: false});
      // put device trackers on the map if they are not in a zone
      if (locations[i].type === "tracker") {
        if (locations[i].state === "not_home") {
          if (locations[i].marker.getVisible() == false) {
            // set visible and move the pin
            locations[i].marker.setOptions({
              position: locations[i].latlng,
              map: map,
              title: locations[i].friendly_name,
              label: locations[i].friendly_name.charAt(0),
              icon: vimage,
              visible: true
            });
          } else { // just move the pin
            locations[i].marker.setPosition(locations[i].latlng);
          }
          // add listener for pop up
          locations[i].marker.addListener('click', function() {
            reversegcodewindow(infowindow, this.getPosition());
            infowindow.open(map,this);
            map.panTo(this.getPosition());
            map.setCenter(this.getPosition());
            map.setZoom(15);
            infoopen = true;
          });
        } else { // in a zone so hide the pin
          locations[i].marker.setVisible(false);
          infowindow.close();
        }
      } else { //put zones on the map
        if (locations[i].marker.getVisible() == false) {
        updateZoneCount(locations[i].friendly_name);
          locations[i].marker.setOptions({
            position: locations[i].latlng,
            map: map,
            title: locations[i].friendly_name,
            visible: true,
            icon: locations[i].icon,
            label: locations[i].tcount.toString(),
          });
        } else {// update the count only
          locations[i].marker.setLabel(locations[i].tcount.toString());
        }
        // information window
        locations[i].marker.addListener('click', function() {
          infowindow.setContent(setNames (this.title));
          infoopen = true;
          infowindow.open(map,this);
          map.panTo(this.getPosition());
          map.setCenter(this.getPosition());
          map.setZoom(15);
        });
      }
    }
    if (infoopen == false)
      zoomExtends();
  } // end SetMarkers

  function zoomExtends(){
    // fit all the markers on the map
    var bounds = new google.maps.LatLngBounds();
    if (locations.length > 0) { 
      for (var z = 0; z < locations.length; z++) {
        if (typeof locations[z].latlng.lng != "undefined"  )
          bounds.extend(locations[z].latlng);
      }    
      map.fitBounds(bounds,{top:30});
    }
  }
  
  function reversegcodewindow(pwindow, pposition)
  {
    //get the address details and show information window
    var geocoder = new google.maps.Geocoder;
    var gccity;
    var gcstate;
    var gcaddr; 
    var gcstreet;
    var street_suburb;
    
    geocoder.geocode({'location': pposition}, function(results, status) {
      if (status === 'OK' && (results[0])) {
        var a = results[0].address_components;
        var gcaddr = results[0].formatted_address;
        var gccity = null, gcstate = null;
        for(i = 0; i < a.length; ++i)
        {
          var t = a[i].types;
          if(compIsType(t, 'administrative_area_level_1')) {
            gcstate = a[i].long_name; //store the state
          } else if(compIsType(t, 'locality')) {
            gccity = a[i].long_name; //store the city
          } else if(compIsType(t, 'route')) {
            gcstreet = a[i].long_name; //store the street
          }
          //we can break early if we find both
          if(gcstate != null && gccity != null) break;
        } //end for
        street_suburb = gcstreet + " " + gccity;
      } else {
         // no result found
         street_suburb = "Not determined";
      }
      pwindow.setContent(street_suburb);
      //return street_suburb;
    }); //end geocoder

  } // end setmarker

  function setNames (pzone) {
    vtext = "At " + pzone;
    for(z = 0; z < locations.length; ++z ) {
      if (locations[z].type === "tracker") {
        if (locations[z].state.toUpperCase() === pzone.toUpperCase())
          vtext = vtext + "<br>" +  locations[z].friendly_name 
      }
    } 
    if (vtext == "") {
      vtext = "No one here";
    }
    return vtext;
  } 

  function compIsType(t, s) { 
    for(z = 0; z < t.length; ++z) {
      if(t[z] == s) 
        return true;
    }
    return false;
  }
 
  function OnStateAvailable(self, state)
  {        
    initiatemap(self,state);
  } // end OnStateAvailable

  function OnStateUpdate(self, state)
  {
    ventity = state.entity_id;
    vlatlng = {lat: state.attributes.latitude, lng: state.attributes.longitude};
    for(i = 0; i < locations.length; ++i) {
      if(locations[i].device == ventity) {
        locations[i].latlng = vlatlng;
        locations[i].state = state.state;
        locations[i].update = true;
        break;
      }
    }
    updateZoneCount();
    
    if (infoopen != true) 
      SetMarkers();
  } // end OnStateUpdate

  function updateZoneCount() {
    // get zone
    for(i = 0; i < locations.length; ++i) {
      var vcount = 0;
      if(locations[i].type == "zone") {
      // now check device trackers
        for(h = 0; h < locations.length; ++h) {
            //count occurences of trackers
            if(locations[h].state.toUpperCase() == locations[i].friendly_name.toUpperCase())
              vcount += 1;
        } 
        locations[i].update = true;
        locations[i].tcount = vcount;
      }
    } 
  } // end updateZoneCount

}