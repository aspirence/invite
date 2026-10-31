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
index.html             the whole invitation — markup, styles and script
assets/
  wedding-arch.webp      original palace arch, cropped at the top with CSS
  corner.webp           floral spray for the opening screen and later scenes
  ganesh.webp           Shri Ganesha artwork
  sprig.webp            floral divider between passages
  rose.webp             single bloom, used for the drifting petals
  tumpremho.mp3         background song, loaded only when sound is switched on
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
through `--bloomTint`.

**The title scene.** The original painted palace arch and flowers frame the
opening passage against a warm ivory background. The transparent WebP image
is reused unchanged; CSS crops its upper edge to remove the exterior space
above the flowers. The pillar portions of that same image are positioned
separately to keep them visible along both sides. The lamps remain removed.
It sits in the first backdrop layer and fades out as the next passage arrives.

**Two fixed stacks.** The scenery is split in two. #backdrop sits behind the
words; #canopy sits in front of them and holds the corner sprays, so a passage
scrolling away slides under the flowers instead of across them. Both stacks
crossfade off the same scroll position. The title scene uses the flowers in
its arch artwork, so its separate canopy sprays are hidden while the layer
remains in place to preserve the scene order.

**Fitting a phone.** The original crown is cropped at its natural proportions;
the pillar portions fill the sides beneath it. Corner sprays, Ganesha and the spaces between lines
are bounded by viewport height as well as width to leave room for the
invitation text.

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
