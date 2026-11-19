# US Trailers – Claude Code Master Brief

## 0. How Justin uses this file

1.  Make a new empty folder on your computer called **us-trailers**.

2.  Save this whole document in it as a file named **CLAUDE.md**.

3.  Open Claude Code in that folder and type: **Read CLAUDE.md and
    start.**

That's it. Everything below is written for Claude Code.

## 1. The mission

Build the website for **US Trailers**, a company that designs and builds
fully custom, bespoke, high-quality trailers for its clients. These are
not average trailers off a production line. Every trailer is made for
one client.

The site must stand with the best websites in the world right now: the
kind that win Awwwards Site of the Day and get shared on TikTok and
Instagram. "Good", "clean" or "professional" is a failure. The target is
a site people screenshot, send to friends, and remember. It also has to
sell: every visitor who is a real buyer should end up sending an
enquiry.

**Start completely fresh.** There is no existing brand, logo, colour
scheme or style to follow. Ignore any earlier ideas about this business
from other chats. You create the brand from zero, based on your
research.

**What is known about the business** (confirm the details with Justin in
your first batch of questions):

- Name: US Trailers. Possible domain: ustrailers.co.za.

- Based in Cape Town, South Africa. Prices in rand (R), South African
  English spelling.

- Builds bespoke trailers. Earlier mentions included toy haulers,
  gooseneck and fifth-wheel trailers, fully custom builds, and custom
  work and modifications on existing trailers. Treat this as a starting
  point, not a limit.

## 2. The prime directive: do it yourself

Before **every** message you send Justin, run this check:

> "Am I about to ask Justin to do something I could do myself, with the
> tools I have or could set up?"

If yes, stop and do it yourself.

- Never hand Justin a list of steps you could carry out. Carry them out.

- Never say "you could try..." about something you can try.

- Never say "I can't see the site." Open it in the browser tool,
  screenshot it, and judge it.

- Never pick the quick, generic or template option because it's faster
  or cheaper. Always run the full process in this file.

- Only ask Justin for things you truly cannot get: real photos and
  videos of his trailers, real prices, business details, logins,
  payments, and decisions marked in this file as his.

- If a tool, connector, skill or key is missing, tell him exactly what
  it is, why it matters, and the exact command or click to fix it, in
  one short message. Then keep working on everything else while you
  wait.

## 3. Think wide, never narrow

- When Justin mentions one cool idea (for example a trailer built part
  by part in 3D), treat it as a signal of the **level** he wants, not
  the whole plan. Do not hyper-focus on it.

- Your job is to know what the whole world of web design is doing right
  now and bring the best of it to this site.

- Every major decision should come from research, not from your first
  idea.

- Keep asking: "What would the best studio in the world do here?"
  Studios to benchmark include Active Theory, Lusion, Locomotive,
  Immersive Garden, Resn, Unseen Studio and Dogstudio. Look them up and
  see their current work.

## 4. Setup check (first thing, every new project)

Check what's installed and working. Install what you can yourself. Then
send Justin one short list of anything only he can do. Look up the
current official install instructions for each tool before installing,
because commands change.

**Must have:**

- **Browser control**: Playwright MCP (for example claude mcp add
  playwright -- npx @playwright/mcp@latest). Use it to open pages,
  screenshot desktop and mobile, scroll, click and record.

- **Chrome DevTools MCP**: for performance traces, console errors and
  network checks.

- **Web search and fetch**: for research.

- **Node.js (latest LTS), Git and GitHub CLI**: new private repo called
  us-trailers, commit after every finished piece.

- **Vercel CLI**: preview link for every version, so Justin can open it
  on his phone with one tap.

**Strongly recommended:**

- **Figma MCP**: Justin already has Figma connected on claude.ai. Use it
  for moodboards, design directions and image generation.

- **Blender MCP**: for real 3D modelling of the trailer parts. If not
  available, model the parts in code with Three.js.

- **Image and video generation**: for concept art and temporary
  photography until real photos exist. Clearly label anything generated.

- **A design skill** (for example frontend-design) if your setup offers
  one. Load it before building UI.

## 5. Memory files (so nothing is lost between sessions)

Create and keep these files updated. Read them at the start of every
session.

- **docs/progress.md**: what's done, what's next, what's blocked. Update
  after every work session.

- **docs/research.md**: references, screenshots, notes and the top ideas
  to steal.

- **docs/brand.md**: the chosen direction, colours, fonts, voice, logo
  rules.

- **docs/decisions.md**: every important decision, with one line on why.

- **docs/questions-for-justin.md**: open questions, batched.

- **research/** folder: all reference screenshots, named clearly.

## 6. Phase 1: understand the business and market

Research this yourself before asking Justin anything.

- **The buyers**: who pays for a bespoke trailer in South Africa? For
  example overlanders, off-road and 4x4 people, boat and bike owners,
  horse owners, mobile businesses like coffee and food trailers, event
  companies, farmers and contractors. Write 4 to 6 short buyer profiles:
  what they want, what they fear, what makes them trust a builder.

- **Competitors**: find the main custom and premium trailer builders in
  South Africa and the best ones worldwide. Screenshot their sites.
  Write down what they all do, so the US Trailers site can do the
  opposite and stand out.

- **The rules**: note the basics buyers ask about, such as roadworthy
  certificates, registration, weight limits and which driver's licence
  code is needed for heavier trailers. Check current official South
  African sources. Use this for the FAQ.

- **Search demand**: find what people in South Africa type into Google
  when looking for custom trailers. Use this for page names and copy.

- Save it all in docs/research.md.

**Then send Justin one batch of questions**, only things you can't find
yourself. For example: which trailer types he wants to lead with, rough
price ranges, typical build time, warranty, who builds the trailers and
their qualifications, workshop address, contact number and WhatsApp,
email, social accounts, and any photos or videos of past builds.

## 7. Phase 2: world-class design research

- Study **at least 25** current award-level sites from Awwwards (Site of
  the Day, Developer Award, Sites of the Month), Godly, The FWA, CSS
  Design Awards, Land-book, Siteinspire and One Page Love.

- Study premium product brands for tone and storytelling: luxury and
  performance car makers, high-end camper and overland brands, premium
  outdoor and tool brands, bespoke watch, knife and furniture makers.

- Study the latest techniques: WebGL and 3D scenes, scroll-driven
  storytelling, exploded product views, real-time configurators,
  physics, custom shaders, smooth scrolling, page transitions, kinetic
  and variable typography, cursor interactions, sound design, and AR
  product views on phones.

- For each strong reference, save desktop and mobile screenshots and
  write: what makes it great, what we steal, what we avoid.

- Finish with a **Top 10 ideas** list in docs/research.md.

## 8. Phase 3: brand and creative direction

- Write the positioning in one sentence: who it's for, what it is, why
  it's different.

- Write the one feeling the site must give, for example "I'm
  commissioning something made only for me, by people who are obsessed
  with the craft."

- Create **three clearly different creative directions**. Each needs:

  - a name and short mood description

  - colour palette and fonts

  - logo idea (a wordmark at minimum)

  - the signature interaction

  - a generated hero concept image or Figma mock, desktop and mobile

- Recommend one, in three sentences, and say why.

- **Justin decides** (decision 1 of 3). Show him the three directions as
  images and a link, not long text.

- After he chooses, finish the brand in docs/brand.md: final logo, full
  colour system, type scale, spacing, voice rules, photography style,
  motion style.

## 9. Phase 4: the site plan

Proposed pages. Adjust based on research.

- **Home**: the signature experience, then proof (builds), then process,
  then a strong call to enquire.

- **Builds**: a portfolio of finished trailers, each as a short story:
  the client's need, the design, the build, the result, with specs.

- **Design your trailer**: the configurator. Pick a type, size, axles,
  finish and options, see it live, then send it as an enquiry.

- **Trailer types**: one page per main type, also good for Google.

- **How it works**: the bespoke process from first call to handover,
  with rough timelines.

- **The workshop / craft**: materials, welding, finishes, quality
  checks, the people.

- **About**.

- **FAQ**: price ranges, build times, licences, roadworthy, warranty,
  delivery.

- **Contact / enquiry**: a smart enquiry form that can include the saved
  configuration, plus WhatsApp, phone and email.

- Legal pages: privacy policy that follows POPIA, terms.

**Justin decides** (decision 2 of 3): approve the page list and the home
page story in one short message.

## 10. Phase 5: the signature experiences

Pick the strongest mix from the menu below and from your research. Don't
build everything. Build the 2 or 3 that create the biggest wow and
support selling.

- **Part-by-part build**: as you scroll, the trailer assembles from
  nothing: chassis, cross members, axles, suspension, wheels, frame,
  floor, body panels, doors, ramp, fittings, lights, finish. Each part
  has a name, its real job and key specs.

- **Exploded view**: pull the trailer apart and float every part with
  labels, then snap it back together.

- **Live configurator**: change length, axles, colour, finish, interior,
  racks and options, see it update in 3D, with a rough price range.

- **Real physics**: suspension moving over rough ground, the ramp
  dropping, doors swinging, the trailer hitching to a vehicle.

- **Material close-ups**: weld beads, powder coat, checker plate,
  galvanising and timber, with realistic lighting.

- **Day, dusk and night lighting** to show lights and finishes.

- **See it in your driveway**: AR view on the phone.

- **Build timeline**: a scrubber showing a real build from raw steel to
  handover.

- **Sound design**: subtle optional sound for metal, hydraulics and
  gravel, off by default.

## 11. 3D pipeline

- Model the trailer as a set of named parts in a clear hierarchy, with
  real-world proportions in metres.

- Each part gets data: name, what it does, material, key spec. The site
  reads this data to show labels and stories.

- Use Blender through MCP if available. Otherwise build the parts in
  code. Export as glTF.

- Compress models (Draco or Meshopt) and textures (KTX2). Target under 5
  MB for the main model on mobile.

- Use React Three Fiber with Drei for the scene and Rapier for physics.

- Load 3D only when needed. Show a beautiful still image first, so the
  page is never blank.

- Weak phones or reduced-motion setting: switch to a lighter version or
  a high-quality video or image sequence.

## 12. Tech stack (choose once, don't switch)

- Next.js (App Router) with TypeScript.

- Tailwind CSS with design tokens from docs/brand.md.

- GSAP with ScrollTrigger for scroll storytelling, Lenis for smooth
  scrolling, Motion (Framer Motion) for interface animation.

- Three.js through React Three Fiber and Drei, Rapier physics.

- Forms: server action that emails the enquiry to Justin, with spam
  protection.

- Hosting on Vercel, with analytics.

- Only change the stack if research proves something clearly better, and
  log why in docs/decisions.md.

## 13. Phase 6: the build loop, one section at a time

Never build the whole site in one go. For every section:

1.  **Plan**: write what it must do, which reference it's aiming at, and
    the motion idea.

2.  **Build** it.

3.  **Look at it**: open it with the browser tool. Screenshot desktop
    (1440 wide) and mobile (390 wide) at several scroll points. Record a
    short scroll video if possible. Check the console for errors.

4.  **Compare** side by side with the best reference.

5.  **Score** it out of 10 on each of: layout, typography, colour,
    motion, wow factor, mobile, speed, and clarity of message.

6.  **If any score is under 9**: write exactly what's wrong (spacing,
    size, timing, easing, lighting, contrast, rhythm), fix it, and go
    back to step 3.

7.  **When every score is 9 or more**: commit, deploy a preview, update
    docs/progress.md, and send Justin the link with one or two
    sentences.

For important sections, get a second opinion: start a fresh review agent
that has not seen your work, give it the screenshots and the references,
and ask it to score honestly.

## 14. Quality bar (every page must pass)

- **Speed**: Lighthouse performance 90 or more on mobile. Largest
  content shows in under 2.5 seconds, no layout jumps, quick response to
  taps.

- **Mobile first**: most visitors will be on phones. Design and check
  mobile as seriously as desktop.

- **Smooth**: animations at 60 frames per second, no jank, no console
  errors.

- **Accessible**: readable contrast, works with a keyboard, respects the
  reduced-motion setting, alt text on images.

- **Real content**: no placeholder text, ever. Write real copy yourself.

- **Browsers**: check Chrome, Safari (including iPhone) and Firefox.

## 15. Copy and content

- Voice: confident, precise and proud of the craft. Short sentences. No
  hype words like "world-class" or "best in class" on the page; show it
  instead.

- Write all copy yourself, based on research and Justin's answers.

- Give Justin a **shot list** for real photos and videos: finished
  trailers outdoors at golden hour, close-ups of welds and finishes, the
  workshop, people at work, the handover moment. Short and clear, so he
  can film it on his phone.

- Until real photos arrive, use generated images that match the brand,
  clearly labelled in the code so they're easy to replace.

## 16. Getting found and getting enquiries

- SEO basics: page titles, descriptions, headings, sitemap, robots file,
  social share images for every page.

- Structured data for a local business and for products.

- Pages and copy built around what South African buyers actually search
  for.

- Steps for Justin's Google Business Profile, written so he can do it in
  10 minutes.

- Enquiry paths on every page: a form, WhatsApp button and phone number.

- Track enquiries with analytics events, so we know what works.

## 17. Launch checklist

- Domain connected, HTTPS working.

- All forms tested end to end; Justin receives the email.

- Favicon, app icons, social share images.

- 404 page that is on-brand.

- Privacy policy (POPIA) and cookie notice if needed.

- Analytics working.

- Final full-site check on desktop and mobile, with screenshots.

- **Justin decides** (decision 3 of 3): approve launch.

## 18. How to talk to Justin

- He's busy. Keep messages short and plain.

- Send links he can open directly. Never zip files.

- Show, don't explain: screenshots and preview links instead of
  paragraphs.

- Batch questions into one message, and only ask what you truly can't do
  yourself.

- When something is blocked, say: what's blocked, what you need from
  him, and what you're doing meanwhile.

- Give a short progress update at the end of every work session.

## 19. Never

- Never use a template look or default component styling.

- Never stop at "it works." Stop at "it's world-class."

- Never hand Justin work you can do yourself.

- Never narrow the vision to the last thing he mentioned.

- Never skip the visual check because you're "confident it looks right."

- Never leave placeholder text or broken links.

## 20. Done means

The site is live, fast, flawless on phones, has at least one experience
people want to share, explains the bespoke process clearly, and turns
visitors into enquiries. Every section scored 9 or more against the best
sites in the world.

## 21. Standing rules from Justin (override anything above)

- **No screenshots, ever.** Do not use screenshots to judge or review the site or reference sites. Work through the connected browser directly: open the live page, read its DOM and accessibility tree, inspect computed styles, layout boxes, console and network, and interact with it (scroll, click, resize). Where this brief says "screenshot", use the live browser inspection instead.
