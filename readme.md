# JOSM Strava Heatmap

This browser extension makes it easy to use the [Strava Global Heatmap][1] in
[JOSM][2] and other mapping applications that support TMS imagery.

Accessing this imagery externally requires a set of key parameters that you obtain
by signing into the Strava website, copying the values from several cookies which
must be included with imagery requests from JOSM in a custom header.  The keys expire
frequently and the process must be repeated.  This extension gathers the url and cookie
values automatically so you can quickly open the imagery in JOSM.

If you use iD, the [Strava Heatmap Extension][8] is a better fit.

OSM Wiki: [Using the Strava Heatmap][3]

[1]: https://www.strava.com/heatmap
[2]: https://josm.openstreetmap.de/ "Java OpenStreetMap Editor"
[3]: https://wiki.openstreetmap.org/wiki/Strava
[8]: https://github.com/julcnx/strava-heatmap-extension

## Installation

Available as a [Firefox Add-On][4] or [Chrome extension][7].  The Chrome extension
should also work in Microsoft Edge and other Chromium based browsers.

## Instructions

1. Visit [strava.com/heatmap][5] and log in – sign up for a free account if you don't have one
2. *Optional* - Select the heatmap color and activity type you want to use
3. Click the button to open the heatmap in JOSM ([Remote control][9] must be enabled)

<img src=screenshot.jpg width=640 alt="Screenshot of Strava Heatmap with button added"/>

[9]: https://josm.openstreetmap.de/wiki/Help/Preferences/RemoteControl

[4]: https://addons.mozilla.org/en-US/firefox/addon/josm-strava-heatmap/
[5]: https://www.strava.com/heatmap
[7]: https://chrome.google.com/webstore/detail/josm-strava-heatmap/hicmfobjcbinceoeegookkgllpdgkcdc
