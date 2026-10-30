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

**The title scene.** The opening passage is staged rather than washed. A
cusped arch is drawn in gold line-work over a cream wall, with silk falling
from the two upper corners, bells and bead strands swaying along its head, and
a standing lamp at each of its feet. The arch is stretched to a portrait column
so it frames the words, while the silk and the bells run out to the screen
edges where the corner flowers already hang; every stroke uses a non-scaling
stroke, so no line thickens as the column widens. All of it sits in the first
backdrop layer, so it fades out with that layer and costs the other eight
scenes nothing.

**Two fixed stacks.** The scenery is split in two. #backdrop sits behind the
words; #canopy sits in front of them and holds the corner sprays, so a passage
scrolling away slides under the flowers instead of across them. Both stacks
crossfade off the same scroll position. The swag stays in #backdrop on purpose:
the last line of every passage sits exactly where it hangs, and its top is
masked to fade out so the words there stay legible.

**Fitting a phone.** The passage is centred between the sprays above it and the
swag below, so it only clears both while its own height stays under twice the
distance from the middle of the screen to whatever the sprays reach. The
sprays, swag, lamps, Ganesha and the stops between lines are all bounded by
svh as well as by width for that reason, and the bells are scaled up and their
inner pair dropped so the remaining ones flank the narrow opening lines rather
than land on them.

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
