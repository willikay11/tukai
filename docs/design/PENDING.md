# Pending items

Updated 2 Oct 2026. Main file: `Tukai Web.dc.html`. Nothing open.

## Closed on 2 Oct
- Moment viewer header: the fix went into a full-screen viewer that could no longer be opened. Moments have opened in the drawer since the redesign, so I removed the viewer. The drawer header is unchanged.
- Slow load: about 110 requests for `{{ ... }}` image URLs from the hidden raw template were blocking the connection, and around 160 images loaded straight away. Template images now lazy-load. The logo and the discount success image are the exceptions because they need their natural size. In preview the load event went from about 21 s to 3 s. File size (1.4 MB) was not the cause.
- Placeholder image errors: fixed by the same change. There are now 0 bad requests.
- "I was there": removed (your call). The "N people were there" line stays.
- Who was there and the comments: still generated sample data. That is expected for the prototype.
- Composer: now "New moment" in the side drawer, like creating an experience (from `uploads/Adding a moment.jpg`). It has your name › Place › Community › Experience as attach slots, "What are you up to?", gallery and camera buttons, and a lime Share moment button. Starting from a place, community or experience fills that slot. You need at least one photo and one attachment to share, and the line under the buttons says what is missing. After sharing, the drawer shows your moment. The moment appears on every page it is attached to.
- View all comments: opens the full list inside the drawer.
- Share: opens a share sheet with copy link, WhatsApp and email. For moments in a private community, it says only members can open the link.
- Moments tab: no filters. Everyone sees all moments.
- Past sessions: experience pages now say "This has run before. N moments from N earlier sessions." above the moments.
- "Been somewhere good?" tile: keeps the card ratio (3:4) at any width.
- Gallery columns: pages and rail breaks always end on a full row. Checked at 2, 3 and 5 columns.
- Restaurant moment ratio: now a Tweak called Feed mix, with Every third, Every other and Newest first. The default is unchanged (Every third).
- Experiences tab communities: kept "See all" and removed the title arrow, to match Discover.
- Bucket list view: the description comes first, in body text. The owner sits apart from the members, with their photo, name and an "Owner" label. Members are a separate group with a count.
- Bucket lists alignment: checked. Both pages use the same container and line up the same way.
- Code cleanup: removed the old moments section outputs, the unused viewer and `momentStep`, and the unused rail options.
- Experience icon on moment attachments: now the calendar. The earlier swap had not made it into the file.
