```text
Redesign my portfolio from scratch. Work directly in the workspace; first inspect the files and identify the actual stack before changing anything.

Context:
- This is a static portfolio site: one HTML file, Tailwind, and likely a little vanilla JavaScript. No React.
- Keep it dependency-light. Use HTML, Tailwind, and plain JS. Do not introduce Next.js, React, Vite, or a component framework.
- Preserve the real content and project details. Rewrite copy only where it makes the story clearer.

Goal:
- Completely replace the current visual design and information architecture. Do not just restyle the existing layout.
- Make it feel like a modern designer/developer portfolio, not a generic template.
- Mobile-first: design for 320–390px first, then tablet and desktop.
- Image-led and vibrant. Use my project screenshots and existing images as the backbone. Only source new images if something is missing, and keep them local.
- Strong typography, generous spacing, a cohesive color system, and restrained motion.

Build:
- Hero: name, positioning, current availability, primary CTA.
- Selected work: 4–6 project cards with image, role, year, and outcome. Add category filtering with vanilla JS.
- About, experience/timeline, skills, and contact.
- Sticky header with a mobile menu; footer with working links.
- Mock functionality only: contact form shows a success state, résumé button works, project filters work, “book a call” shows a toast. No backend.
- Skip complex modals. Use inline sections or a simple lightbox only if it stays lightweight.

Quality:
- Semantic HTML, keyboard accessible, visible focus states, alt text, reduced motion.
- No horizontal scroll at 320px. Test 390/768/1440.
- No heavy libraries; keep it fast.
- Preserve or improve SEO metadata and Open Graph tags.
- No lorem ipsum, broken links, or dead buttons.
- Check the browser console for errors.

Do not:
- Do not stop at a plan. Implement the redesign.
- Do not wire forms or auth to a backend.
- Do not add React or a build system unless the existing file requires it.
- Do not spend time browsing for layouts; make confident design decisions.

Done when:
- The page loads from the HTML file, looks intentional at mobile and desktop, every control works or gives mock feedback, and there are no console errors.
```