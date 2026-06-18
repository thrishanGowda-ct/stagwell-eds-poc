# Stagwell Homepage Migration Plan

Migrate **https://www.stagwellglobal.com/** homepage content and blocks to AEM Edge Delivery Services. Scope is **page content & blocks only** (no navigation, footer, or design styling in this pass).

## Source Page Summary

Content blocks identified on the homepage:
- **Hero** — "Creative + Connected = Effective" tagline
- **Stats / Company Overview** — 13,000+ specialists, 34+ countries, 1,250 engineers, 427 Cannes Lions
- **Capabilities** — 5 items (Digital Transformation, Research & Insights, Global Media & Content, Public Affairs & Advocacy, Compelling Scaled Creative)
- **Competitive Positioning** — "The Challenger Marketing Network"
- **Investor Highlights** — 70+ partners, $2.7B FY22 revenue, $451M FY22 adjusted EBITDA

## Approach

The migration is orchestrated end-to-end: analyze the page structure, map content sequences to existing EDS blocks (creating new block variants only where needed), build the import infrastructure (parsers + transformers), then run the import to generate the AEM content document. Navigation, footer, and design styling are intentionally out of scope and can be added in later passes.

## Checklist

- [ ] Determine project type (doc / da / xwalk) and the project's Block Library endpoint
- [ ] Scrape and analyze the homepage to identify sections, content sequences, and authoring decisions
- [ ] Survey available EDS blocks and map each content sequence to a block (reuse existing variants; create new variants only where required)
- [ ] Generate the page template skeleton and add block mappings (DOM selectors)
- [ ] Generate import infrastructure — block parsers and page transformers
- [ ] Build/bundle the import script
- [ ] Run the import to produce the AEM content document for the homepage
- [ ] Preview the imported page and verify rendering matches source content structure
- [ ] Report results and flag any sections needing follow-up (nav, footer, design)

> Note: This plan covers page content & blocks only. Executing the migration requires Execute mode.
