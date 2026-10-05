<!--
Source: uploads/Tukai_Web_App_Redesign_Claude_Design_Brief.md in the design project,
section 11 (Discover), copied verbatim. This brief is the source of truth for the redesign.
Re-copy if the brief changes; do not hand-edit.
-->

## 11. Discover: the redesigned first impression

### 11.1 Page objective

Within a few seconds, a visitor should be able to find something relevant, understand that Tukai supports lists and communities, and begin without a registration wall.

Recommended opening copy:

**What would you like to do?**  
Find experiences, keep your ideas, and discover people who share your interests.

Keep this introduction compact. Do not create a full-screen hero or place text on a busy event poster.

### 11.2 Guest Discover order

| Order | Module | Purpose and content |
| --- | --- | --- |
| 1 | Location, search, quick filters | Explicit city selector; one search box; When, Budget, Interests, Filters |
| 2 | Things to do soon | Relevant upcoming activities; use Today/This weekend only when the filter matches |
| 3 | Public Bucket Lists | Clear themed collections with item count, curator, and public membership action |
| 4 | Communities to explore | Groups matched to the selected place/interests; next activity where available |
| 5 | What's happening at places | Place cards featuring an actual current/upcoming happening |
| 6 | Moments from the community | A small set of attributed media cards, each linking to its Place/Experience/Community |
| 7 | Explore further | Cities, itineraries, and broader editorial collections behind clear See all routes |

Bucket Lists and Communities must be among the first three substantive content modules. Their permanent navigation entries provide immediate access regardless of scroll position.

At initial mobile load, prioritise the first few modules; load later images progressively. Do not render a page of empty section headings while waiting for data.

### 11.3 Returning-user adaptation

A signed-in user may see one compact **Continue planning** row before recommendations: a recently edited list or upcoming confirmed plan. Do not add an entire dashboard above discovery.

Use relevant signals, with clear explanations when useful:

- Selected location and date.
- Explicit interests.
- Public Communities and lists the person joined.
- Their own saved items, subject to their privacy settings.

Do not expose a private list's influence to another person or generate public labels that reveal its contents. Let users reset or edit interests.

### 11.4 Public-list distribution rules

Include a dedicated Public Bucket Lists module and a complete list-results view. New published lists are searchable and browseable; featured placement can depend on relevance and quality.

Eligibility: Public, published, active, not removed, at least one valid public item, and no restricted content in cover or description. Use title clarity, locality, theme coherence, freshness, and useful items as editorial criteria.

Show **Curated by Tukai** only for lists actually curated by the Tukai team. Label paid placement separately if it is introduced. Member count is context, not proof of quality or availability.

### 11.5 Low-supply behaviour

- If there are no matching experiences today, say so and offer a nearby date.
- If expanding the area, use **“A little further away”** with the new area/distance. Do not retain the original Nearby label.
- If no Public Lists match, offer a broader scope and Create a list.
- Show fewer good modules instead of filling every slot with duplicates.
- Limit repeated appearances of the same Experience in the first several modules.
- A Community with no upcoming activity can still be shown for a relevant purpose, but it should not receive an active-this-week label.
- Show evergreen Place ideas and editorial public lists as alternatives to missing timed inventory.
- Do not fabricate inventory, ratings, friend activity, popularity, scarcity, or personalised recommendations.

### 11.6 Location rules

Use a visible, editable place selector. For an unknown visitor, a suggested city may be shown as a suggestion, not as detected location. The user can select Nairobi or another supported area without granting location permission.

Only request device location after an explicit **Use my location** action. If denied, continue with manual city selection and remember that choice. Avoid repeated permission prompts during routine navigation.

Distances require reliable coordinates and a known origin. Otherwise show the locality. Community locality, a business address, and an Experience meeting point are different facts and must not be substituted for one another.
