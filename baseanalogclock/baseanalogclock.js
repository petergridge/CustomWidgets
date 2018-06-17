function baseanalogclock(widget_id, url, skin, parameters)
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
     
    var monitored_entities = []
    
    // Finally, call the parent constructor to get things moving
    
    WidgetBase.call(self, widget_id, url, skin, parameters, monitored_entities, callbacks)  

    // Function Definitions
    
    // The StateAvailable function will be called when 
    // self.state[<entity>] has valid information for the requested entity
    // state is the initial state

    var vdayoptions = {weekday: 'long'};
    var vdateoptions = {year: 'numeric', month: 'long', day: 'numeric'};

    var width  = document.getElementById(widget_id).clientWidth;
    var height = document.getElementById(widget_id).clientHeight;
    var canvas = document.createElement("canvas");    
    document.getElementById(widget_id).appendChild(canvas);

    var ctx = canvas.getContext("2d");

    ctx.canvas.width  = width;
    ctx.canvas.height = height;

    var radius = canvas.width / 2;
    ctx.translate(radius, radius);
    radius = radius * 0.90;

    drawClock(self);

    setInterval(drawClock, 1000,self);

    function drawClock(pself) {
      drawFace(ctx, radius);
      drawNumbers(ctx, radius);
      drawTime(ctx, radius);
      drawDay(pself, ctx, radius);
    }

    function drawFace(ctx, radius) {
      var grad;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, 2*Math.PI);
      ctx.fillStyle = 'white';
      ctx.fill();
      grad = ctx.createRadialGradient(0,0,radius*0.95, 0,0,radius*1.05);
      grad.addColorStop(0, '#333');
      grad.addColorStop(0.5, 'white');
      grad.addColorStop(1, '#333');
      ctx.strokeStyle = grad;
      ctx.lineWidth = radius*0.1;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, radius*0.1, 0, 2*Math.PI);
      ctx.fillStyle = '#333';
      ctx.fill();
    }

    function drawNumbers(ctx, radius) {
      var ang;
      var num;
      ctx.font = radius*0.15 + "px arial";
      ctx.textBaseline="middle";
      ctx.textAlign="center";
      for(num = 1; num < 13; num++){
        ang = num * Math.PI / 6;
        ctx.rotate(ang);
        ctx.translate(0, -radius*0.85);
        ctx.rotate(-ang);
        ctx.fillText(num.toString(), 0, 0);
        ctx.rotate(ang);
        ctx.translate(0, radius*0.85);
        ctx.rotate(-ang);
      }
    }

    function drawDay(pself, ctx, radius) {  
      var vdate = new Date();
      var vdayoutput;
      var vdateoutput;
      var vlastday;

      if ("date_format_country" in pself.parameters)
      {
        if ("date_format_options" in pself.parameters)
        {
         vdayoutput = vdate.toLocaleDateString(pself.parameters.date_format_country,vdayoptions);
         vdateoutput = vdate.toLocaleDateString('en-AU',pself.parameters.date_format_options);
        }
        else
        {
         vdayoutput = vdate.toLocaleDateString(pself.parameters.date_format_country,vdayoptions);
         vdateoutput = vdate.toLocaleDateString('en-AU');
        }
      }
      else
      {
       vdayoutput = vdate.toLocaleDateString(vdate.getTimezoneOffset(),vdayoptions);
       vdateoutput = vdate.toLocaleDateString(vdate.getTimezoneOffset()); 
      }
      
      if (vlastday != vdayoutput) {
        ctx.font = radius*0.15 + "px arial";
        ctx.textAlign="centre";   
        ctx.fillText(vdayoutput, 0, -1*height/5);

        ctx.font = radius*0.15 + "px arial";
        ctx.textAlign="centre";   
        ctx.fillText(vdateoutput, 0, height/5);
      }    

      vlastday = vdayoutput;

    }

    function drawTime(ctx, radius){
        var now = new Date();
        var hour = now.getHours();
        var minute = now.getMinutes();
        var second = now.getSeconds();
        //hour
        hour=hour%12;
        hour=(hour*Math.PI/6)+
        (minute*Math.PI/(6*60))+
        (second*Math.PI/(360*60));
        drawHand(ctx, hour, radius*0.5, radius*0.07);
        //minute
        minute=(minute*Math.PI/30)+(second*Math.PI/(30*60));
        drawHand(ctx, minute, radius*0.8, radius*0.07);
        // second
        second=(second*Math.PI/30);
        drawHand(ctx, second, radius*0.9, radius*0.02);
    }

    function drawHand(ctx, pos, length, width) {
        ctx.beginPath();
        ctx.lineWidth = width;
        ctx.lineCap = "round";
        ctx.moveTo(0,0);
        ctx.rotate(pos);
        ctx.lineTo(0, -length);
        ctx.stroke();
        ctx.rotate(-pos);
    }    
}
