# cxvm.github.io

Personal engineering portfolio of Ivan Okhapkin. Static site: HTML, CSS, Three.js (3D viewer), Chart.js (charts). No build step.

Live: **[cxvm.github.io](https://cxvm.github.io)**

## Built with AI

I'm a mechanical / robotics student, not a web developer, so I vibe-coded this site with Claude (Anthropic) instead of writing the code by hand. I treat this as a skill in itself: using an AI model as a tool to get a working result in an area outside my main field.

**What I did:**
- defined what the site should be: a dark-blue portfolio, project cards on the home page, a rotating 3D model next to the description, charts at the end
- supplied all the engineering content: CAD assemblies (STEP), measured part masses, photos, video, the project story and the design decisions
- reviewed every version in the browser and steered the changes (layout, text, what to show and what to cut)
- caught problems and had them fixed, e.g. the torque calculation was redone after I weighed the real printed parts

**What Claude did:**
- wrote the HTML, CSS and JavaScript
- converted my SolidWorks assemblies into lightweight web 3D models
- built the charts from my measured data
- set up the GitHub Pages deployment

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
