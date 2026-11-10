# cxvm.github.io

Personal engineering portfolio of Ivan Okhapkin. Static site: HTML, CSS, Three.js (3D viewer), Chart.js (charts). No build step.

## Structure

```
index.html                  home page, project cards
assets/css/style.css        all styles
assets/js/projects.js       list of projects shown on the home page
assets/js/viewer.js         rotating 3D viewer for .glb models
assets/js/charts.js         charts for the robot arm page
assets/vendor/              three.js and chart.js (local copies)
projects/<slug>/index.html  project page
projects/<slug>/model.json  3D model (glTF with embedded data)
projects/<slug>/media/      photos, video, thumbnail
projects/<slug>/files/      PDFs and downloads
```

## Adding a project

1. Copy `projects/engine/` to `projects/<new-slug>/` and edit the text in `index.html`.
2. Put the 3D model as `model.json` in that folder (or leave it out: the viewer shows "3D model coming soon").
3. Put a card photo as `media/thumb.jpg` (16:10 works best).
4. Add an entry to `assets/js/projects.js`.

## Media for the robot arm page

Files with these names appear automatically, missing ones are hidden:

- `projects/robot-arm/media/thumb.jpg` - card photo on the home page (falls back to the 3D render)
- `projects/robot-arm/media/demo.mp4` - video
- `projects/robot-arm/media/photo-1.jpg` ... `photo-3.jpg` - photos

Keep the video under ~20 MB (H.264, 1080p or 720p).
