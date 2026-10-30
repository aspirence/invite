# Saharsh weds Shreya

A digital wedding invitation — one continuous scrolling page for the wedding of
Saharsh and Shreya, 20–21 November 2026 at Scorpio Club, Kursi Road, Lucknow.

## Running it

It is a single self-contained HTML file. Open `index.html` in a browser, or
serve the folder:

```sh
python3 -m http.server 8000   # then visit http://localhost:8000
```

Everything must be served from the same folder as `assets/`, since the page
references the images and audio by relative path.

## What's in here

```
index.html        the whole invitation — markup, styles and script
assets/
  garland.webp    rose arrangement along the foot of every scene
  corner.webp     spray hanging from the two top corners
  rose.webp       single bloom, used for the drifting petals
  tumpremho.mp3   background song, loaded only when sound is switched on
```

## How it works

**One backdrop, many scenes.** A fixed backdrop holds nine layers, one per
passage. Scrolling crossfades between them, so the sky changes colour under the
words rather than the page breaking into separate cards. The handover is timed
off the band boundary crossing the top of the viewport, so a passage's text is
gone before its palette is.

**Palettes.** Five palettes — rose, haldi, sangeet, vivah and reception — each a
block of CSS custom properties. Every scene keeps its own hue but sits in the
same dusty, desaturated register. The flower photographs are tinted per palette
through `--bloomTint`, and the border takes its colour from the passage you are
reading.

**Opening.** The page opens behind a wax seal. Tapping it, scrolling, swiping,
dragging the scrollbar or pressing Down/PageDown/Space all open it. A tap starts
from the top; a scroll carries on from where you were.

**Personalised links.** Adding `#guest-name` to the URL addresses the card to
that guest — `…/index.html#sharma-family` greets the Sharma Family. The panel at
the foot of the page generates the ending.

**Other bits.** A live countdown to the pheras, Google Calendar links for each
function, a maps link for the venue, tap-to-copy phone numbers, and a canvas of
drifting roses that is deliberately painted below the text.

## Notes

- The song is `preload="none"` so it only downloads once a reader turns sound on.
- Audio autoplay is refused when the page is opened by scrolling rather than
  tapping, since a scroll is not a user gesture; the toggle reports off in that
  case rather than claiming to play.
- Motion and the drifting petals are disabled under `prefers-reduced-motion`.
