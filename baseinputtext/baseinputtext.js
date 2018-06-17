function baseinputtext(widget_id, url, skin, parameters)
{
    // Will be using "self" throughout for the various flavors of "this"
    // so for consistency ...
    
    self = this;
    
    // Initialization
    
    self.widget_id = widget_id;
//    self.state = state.state;
    // Parameters may come in useful later on
    
    self.parameters = parameters;

    if ("monitored_entity" in self.parameters)
    {
        entity = self.parameters.monitored_entity
    }
    else
    {
        entity = self.parameters.entity
    }
   // Get the modal
    var modal = document.getElementById(widget_id).querySelector("#myModal");

    self.OnSaveClick = OnSaveClick
    self.OnCancelClick = OnCancelClick
    self.OnEditClick = OnEditClick     
    
    var callbacks =
        [
            {"selector": '#' + widget_id + ' #save', "action": "click", "callback": self.OnSaveClick},
            {"selector": '#' + widget_id + ' #cancel', "action": "click", "callback": self.OnCancelClick},
            {"selector": '#' + widget_id + ' #edit', "action": "click", "callback": self.OnEditClick}
        ];
    // Define callbacks for entities - this model allows a widget to monitor multiple entities if needed
    // Initial will be called when the dashboard loads and state has been gathered for the entity
    // Update will be called every time an update occurs for that entity

    self.OnStateAvailable = OnStateAvailable
    self.OnStateUpdate = OnStateUpdate
    
    var monitored_entities = 
        [
            {"entity": entity, "initial": self.OnStateAvailable, "update": self.OnStateUpdate}
        ]
    // Finally, call the parent constructor to get things moving
    
    WidgetBase.call(self, widget_id, url, skin, parameters, monitored_entities, callbacks)  

    // Function Definitions
    
    // The StateAvailable function will be called when 
    // self.state[<entity>] has valid information for the requested entity
    // state is the initial state

    function OnStateAvailable(self, state)
    {    

       set_value(self, state);
      self.state = state.state;
    }
 
    function OnStateUpdate(self, state)
    {
      set_value(self, state)
      self.state = state.state;
    }

    //update to force text data type eg keep leading zero on mobile phone number
    function set_value(self, state)
    {
        value = state.state;
        
        self.set_field(self, "value_style", self.parameters.css.text_style);
        self.set_field(self, "value", self.map_state(self, value))
    } // end set_value
    
    function OnEditClick(self)
    {
      vtitle = document.getElementById(widget_id).querySelector("#title").innerHTML;
      document.getElementById(widget_id).querySelector("#Modal_Title").innerHTML = "Edit " + vtitle;
      var modal = document.getElementById(widget_id).querySelector("#myModal");
      modal.style.display = "flex";
      document.getElementById(widget_id).querySelector("#minput").value = self.state;
      document.getElementById(widget_id).querySelector("#error-msg").textContent = "";
      document.getElementById(widget_id).querySelector("#error").style.visibility = "hidden";
      document.getElementById(widget_id).querySelector("#minput").focus();
    } // end OnEditClick

    function OnSaveClick(self)
    {
      if ("regexp"  in self.parameters) {
        var regexp = new RegExp(self.parameters.regexp);
//        alert (regexp);
      } else {
        var regexp = /.*/;
      }
      if ("error_msg"  in self.parameters) {
        var error_msg = self.parameters.error_msg;
//        alert (regexp);
      } else {
        var error_msg = "Regexp not matched";
      }      
      //email
      //var regexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      //basic Australian mobile phone
      //var regexp = /^04[0-9]{8,8}$/;
      //anything
      //var regexp = /.*/;

      if (validateRE(document.getElementById(widget_id).querySelector("#minput").value ,regexp))
      {
        self.state = document.getElementById(widget_id).querySelector("#minput").value;
        args = self.parameters.post_service
        args["value"] = self.state
        self.call_service(self, args)
        modal.style.display = "none";
      } else { /* an invalid format */
        // get error message parameter eg. 'invalid phone number'
        document.getElementById(widget_id).querySelector("#error-msg").textContent = error_msg;
        //set the error visible
        document.getElementById(widget_id).querySelector("#error").style.visibility = "visible"
        document.getElementById(widget_id).querySelector("#minput").focus();
      }
    } // end OnSaveClick
    
    function OnCancelClick(self)
    {
       modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    document.onclick = function(event) {
      if (event.target == modal) {
          modal.style.display = "none";
      }
    }
    
    function validateRE(pString,re) {
      return re.test(String(pString));
    }
}