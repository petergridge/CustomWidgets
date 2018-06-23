function baseiconeval(widget_id, url, skin, parameters)
{
  // Will be using "self" throughout for the various flavors of "this"
  // so for consistency ...
  
  self = this;
  
  // Initialization
  
  self.widget_id = widget_id;
  
  // Parameters may come in useful later on
  
  self.parameters = parameters;
  
  self.OnButtonClick = OnButtonClick;
  if ("enable" in self.parameters && self.parameters.enable == 1)
  {
    var callbacks =
    [
        {"selector": '#' + widget_id + ' > span', "action": "click", "callback": self.OnButtonClick},
    ]
  }            
  else
  {
      var callbacks = []
  }        
  self.OnStateAvailable = OnStateAvailable;
  self.OnStateUpdate = OnStateUpdate;

  var monitored_entities = 
    [
      {"entity": parameters.entity, "initial": self.OnStateAvailable, "update": self.OnStateUpdate}
    ];
  
  // Finally, call the parent constructor to get things moving
  
  WidgetBase.call(self, widget_id, url, skin, parameters, monitored_entities, callbacks);

  // Function Definitions
  
  // The StateAvailable function will be called when 
  // self.state[<entity>] has valid information for the requested entity
  // state is the initial state
  
  function OnStateAvailable(self, state)
  {        
    self.state = state.state;
    set_view(self, self.state)
  }
  
  // The OnStateUpdate function will be called when the specific entity
  // receives a state update - its new values will be available
  // in self.state[<entity>] and returned in the state parameter
  
  function OnStateUpdate(self, state)
  {
    self.state = state.state;
    set_view(self, self.state)
  }

  // Set view is a helper function to set all aspects of the widget to its 
  // current state - it is called by widget code when an update occurs
  // or some other event that requires a an update of the view
  /*
  tabletBattery:
      widget_type: icon1
      title: "Tablet Battery"
      entity: sensor.tablet_battery
      icons:
        "empty":
          icon: fa-battery-empty
          style: "color: red"
          rule: "<5"
        "low":
          icon: fa-battery-quarter
          style: "color: orange"
          rule: "<25"
        "half":
          icon: fa-battery-half
          style: "color: Chartreuse"
          rule: "<50"
        "high":
          icon: fa-battery-three-quarters
          style: "color: Chartreuse"
          rule: "<75"
        "full":
          icon: fa-battery-full
          style: "color: Chartreuse"
          rule: "<=100"
        "charging":
          icon: fa-plug
          style: "color: Chartreuse"
        "default":
          icon: fa-plug
          style: "color: red"
  */
  
  function set_view(self, state, level)
  {
    vstate = state;
    
    if ("icons" in self.parameters)
    {
      //loop through the icons parameter list
      // to get and evaluate the rule against the state
      // exit the loop when a rule evaluates as true
      p = self.parameters.icons;
      var keys = Object.keys(self.parameters.icons);
      for (var i in p) {
        if (p.hasOwnProperty(i)) {
          // no rule needed if state matches
          if (i == state) {
              vstate = i;
              break;
          }
          // eval the rule
          try{
            if (eval(state + p[i]["rule"])) {
              vstate = i;
              break;
            }
          } 
          catch {
            // don't fail if bad rule provided
            vstate = "baseicon_error";
          }
        }
      }  //end i loop

      if (vstate in self.parameters.icons)
      {
        self.set_icon(self, "icon", self.parameters.icons[vstate].icon);
        self.set_field(self, "icon_style", self.parameters.icons[vstate].style);
      }
      else if ("default" in self.parameters.icons)
      {
        self.set_icon(self, "icon", self.parameters.icons['default'].icon);
        self.set_field(self, "icon_style", self.parameters.icons['default'].style);
      }
      else
      {
        self.set_icon(self, "icon", "fa-circle-thin");
        self.set_field(self, "icon_style", "color: white");
      }
      
      if (vstate == "baseicon_error")
      {
        self.set_icon(self, "icon", "fa-exclamation-triangle");
        self.set_field(self, "icon_style", "color: orange");
      }
    }

    if ("state_text" in self.parameters && self.parameters.state_text == 1)
    {
        self.set_field(self, "state_text", self.map_state(self, state))
    }
  } //end set_view

  function OnButtonClick(self)
  {
  if (self.state == 'charging')
    {
      args = self.parameters.post_service_inactive
    }
    else
    {
      args = self.parameters.post_service_active
    }
    self.call_service(self, args);
  }  //end OnButtonClick

}