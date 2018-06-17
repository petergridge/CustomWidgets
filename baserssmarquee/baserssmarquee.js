function baserssmarquee(widget_id, url, skin, parameters)
{
  /***********
  RSS feed marquee:
  - each story is hyperlinked to open the target
  - displays the items title element
  - displays an image if referenced

  - not tested against skins
  
  Parameters: See RSS in HADashboard for setting up RSS feeds in appdaemon.yaml
  entity
  - the name of the configured feed - this must match the target_name 
    configured in the AppDaemon configuration
  interval (integer)
  - sets the speed of the animation. 
    default is 15s per story
  ***********/
  
  self = this
  
  // Initialization
  
  self.parameters = parameters;
  
  var callbacks = [];

  self.OnStateAvailable = OnStateAvailable;
  self.OnStateUpdate = OnStateUpdate;
  
  if ("entity" in self.parameters){
    var monitored_entities = 
      [{"entity": self.parameters.entity, "initial": self.OnStateAvailable, "update": self.OnStateUpdate}]
  }else{
    var monitored_entities =  []
  }  
  
  // Call the parent constructor to get things moving
  
  WidgetBase.call(self, widget_id, url, skin, parameters, monitored_entities, callbacks);

  var vRSSspeed;
  if ("interval" in self.parameters) {
    vRSSspeed = self.parameters.interval; 
  } else {
    vRSSspeed = 15;
  }
  
  var vmaxstories
  if ("recent" in self.parameters) {
    vmaxstories = self.parameters.recent; 
  } else {
    vmaxstories = 30;
  }

  var selfheight = document.getElementById(widget_id).clientHeight
  // set the width in the css so marquee starts outside the widget
  var selfwidth = document.getElementById(widget_id).clientWidth
  //alert(selfwidth);
  //document.getElementById(widget_id).querySelector("#wrap").style["width"] = selfwidth + "px";
  //document.getElementById(widget_id).style["--container-width"] = selfwidth + "px";
  document.getElementById(widget_id).style.setProperty('--container-width', selfwidth + 'px');
  document.getElementById(widget_id).style.setProperty('--container-width2', selfwidth*2 + 'px');

  function OnStateAvailable(self, state)
  {    
      set_value(self, state)
  }

  function OnStateUpdate(self, state)
  {
      set_value(self, state)
  }

  function splitText(s)
  {
    var middle = Math.floor(s.length / 2);
    var before = s.lastIndexOf(' ', middle);
    var after = s.indexOf(' ', middle + 1);

    if (middle - before < after - middle) {
        middle = before;
    } else {
        middle = after;
    }

    var s1 = s.substr(0, middle);
    var s2 = s.substr(middle + 1);
    
    return {s1: s1, s2: s2};
  } //end splitText

  function set_value(self, state) {
    var x, i, xmlDoc, tictext, txt, vimage;
    var stories = self.entity_state[parameters.entity].feed.entries;

    txt = " ";
    tictext = " ";

    // iterate through all the stories to build the marquee information
    xl = stories.length;
    for (i = 0; i< xl; i++) {
      if (i >= vmaxstories) {break};
      var vimage = "";
      story = stories[i]
      vtitle = story.title
      vlink = story.link

      if ('media_thumbnail' in story) {
          vimage = story.media_thumbnail[0]['url'];
      }
        
      if (vimage.length == 0) {
        if ('media_content' in stories[i]) {
          var mc = story.media_content;
          mcl = mc.length;
          for (mci = 0; mci< mcl; mci++) { 
            if (story.media_content[mci].type == 'image/jpeg') {
              vimage = story.media_content[mci]['url'];
              if (story.media_content[mci].isDefault != "" ) {
                break;
              }
            }
          }  // end for
        }
      } 

      // get the enclosure image as the last option
      if (vimage.length == 0) {
        if ('enclosure' in stories[i]) {
          if (story.enclosure['type'] == 'image/jpeg') {
            vimage = story.enclosure['url'];
          }
        }
      }

      var splittxt = splitText(vtitle);

      //Build the output text
      var ticitem = "";
      if (vimage.length > 0 ) {
      // resize the image to fit in the widget and maintain aspect ratio 
        imgheight = selfheight - 10;
        ticitem += "<div class='marquee_item'><table><tr><td><img src='" + vimage  + "' width='" + imgheight + "'></td>";
      } else {
        ticitem += "<div class='marquee_item'><table><tr><td><img width='" + imgheight + "'></td>"
      }
      var split = splitText(vtitle);
      
      ticitem += "<td><table>"
      ticitem += "<tr><td><a href='" + vlink + "' target='_blank'>" + split.s1 + "</a></td></tr>";
      ticitem += "<tr><td><a href='" + vlink + "' target='_blank'>" + split.s2 + "</a></td></tr>";
      ticitem += "</table></td></tr></table></div>";
      tictext += ticitem
    } // end for

    //15 seconds for each story for the animation
    var duration =  i * vRSSspeed; 
    document.getElementById(widget_id).querySelector("#marquee").style["animation-duration"] = duration + "s";
    // put generated html into ticker element
    document.getElementById(widget_id).querySelector("#marquee").innerHTML = tictext;
   
  }//end set_value

} //end baseRSSmaquee