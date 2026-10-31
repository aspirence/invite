# Saharsh weds Shreya

Digital invitations for Saharsh and Shreya at Scorpio Club, Kursi Road, Lucknow.
The main page covers the wedding celebrations on 20–21 November 2026.
`/reception` is a separate reception-only invitation for Saturday,
21 November 2026, from 7:00 p.m. onwards.

## Running it

These are static HTML pages with shared styles, artwork and JavaScript. Serve
the project folder:

```sh
python3 -m http.server 8000   # then visit http://localhost:8000
```

Visit `http://localhost:8000/` for the wedding invitation or
`http://localhost:8000/reception/` for the reception invitation. Keep the folder
structure intact so that both pages can load the shared assets. Static hosts
can serve `/reception` through the directory's `index.html`; preserve their
normal redirect to `/reception/` when deploying under a project subpath.

## What's in here

```
index.html             wedding invitation
reception/index.html   reception-only invitation
assets/
  invitation.css       shared layouts, colours and responsive styles
  invitation.js        shared scrolling, countdown, personalisation and sound
  share.jpg            wedding link preview
  reception-share.jpg  reception link preview
  wedding-arch-rose.webp  continuous rose and champagne palace frame
  corner.webp           floral spray for the opening screen and later scenes
  ganesh.webp           Shri Ganesha artwork
  sprig.webp            floral divider between passages
  rose.webp             single bloom, used for the drifting petals
  tumpremho.mp3         background song, loaded only when sound is switched on
```

## How it works

**One backdrop, many scenes.** A fixed backdrop holds one layer per passage:
nine in the wedding invitation and five in the reception invitation. Scrolling
crossfades between them, so the sky changes colour under the
words rather than the page breaking into separate cards. The handover is timed
off the band boundary crossing the top of the viewport, so a passage's text is
gone before its palette is.

**Palettes.** Five palettes — rose, haldi, sangeet, vivah and reception — each a
block of CSS custom properties. Every scene keeps its own hue but sits in the
same dusty, desaturated register. The flower photographs are tinted per palette
through `--bloomTint`.

**The title scene.** A rose and champagne palace arch frames the opening
passage in the same blush, maroon and sage palette as the couple scene.
The arch and its pillars form one continuous transparent WebP image, with
its upper edge cropped to remove the exterior space above the flowers.
The lamps remain removed.
It sits in the first backdrop layer and fades out as the next passage arrives.

**Two fixed stacks.** The scenery is split in two. #backdrop sits behind the
words; #canopy sits in front of them and holds the corner sprays, so a passage
scrolling away slides under the flowers instead of across them. Both stacks
crossfade off the same scroll position. The title scene uses the flowers in
its arch artwork, so its separate canopy sprays are hidden while the layer
remains in place to preserve the scene order.

**Fitting a phone.** The continuous frame fits the portrait viewport. Wide
screens keep its natural image height and crop it to the window. Corner
sprays, Ganesha and the spaces between lines
are bounded by viewport height as well as width to leave room for the
invitation text.

**Opening.** The page opens behind a wax seal. Tapping it, scrolling, swiping,
dragging the scrollbar or pressing Down/PageDown/Space all open it at the title
passage.

**Personalised links.** Adding `#guest-name` to the URL addresses the card to
that guest — `…/#sharma-family` or `…/reception/#sharma-family` greets the Sharma
Family. The reception opener keeps its reception label when a guest is named.

**Countdowns.** Each page sets its own `data-countdown-at` and
`data-countdown-complete` attributes on `<body>`. The wedding counts down to
21 November 2026 at 10:00 a.m. IST; the reception counts down to 7:00 p.m. IST
that evening. Both pages include a venue map link, a tap-to-copy phone number,
and drifting roses painted below the text.

**Link previews.** Each invitation has its own title, description and JPEG
preview. Their source layouts are `assets/share-card.html` and
`assets/reception-share-card.html`; render at 1200 × 630 when updating them.

## Notes

- The song is `preload="none"` so it only downloads once a reader turns sound on.
- Audio autoplay is refused when the page is opened by scrolling rather than
  tapping, since a scroll is not a user gesture; the toggle reports off in that
  case rather than claiming to play.
- Motion and the drifting petals are disabled under `prefers-reduced-motion`.
