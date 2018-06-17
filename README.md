# CustomWidgets
Home Assistant Appdaemon HADashboard custom widgets

I am not sure that I have applied styles correctly or at all to these so if there are issues and you can help with please let me know. 

# Google Map Widget
Presents tracked devices and zones in a google map. 

The zone shows the count of devices in the location, devices show first character of the tracked device's friendly name. 

An information window is shown when the pin is clicked, with zones showing the friendly name of each tracked device and a divice pin showing the suburb/street name it is currently located.

- requires Google API key
  - Maps JavaScript API
  - Geocoding API
  
see the .dash extract for settings.

# Analogue Clock Widget
Shows an old fashioned clock face with day and date.

# RSS Marquee
Shows a ticker/marquee style for rss feeds. 

Uses the AppDaemon RSS widget as the basis for this so the setup is pretty much identical. 
- set the feeds up as documented in the AppDaemon HADashboard documentation.
- interval setting defines the speed of the ticker
- recent sets the maximum number of stories to show.
