/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-about-page.js
  var import_about_page_exports = {};
  __export(import_about_page_exports, {
    default: () => import_about_page_default
  });

  // tools/importer/parsers/hero-intro.js
  function parse(element, { document }) {
    const logoImg = element.querySelector(".et_pb_image_0 img, .et_pb_image img");
    const playIcon = element.querySelector(".et_pb_image_1 img");
    const textInners = Array.from(element.querySelectorAll(".et_pb_text .et_pb_text_inner"));
    const items = [];
    textInners.forEach((inner) => {
      Array.from(inner.children).filter((node) => node.matches("h1, h2, h3, h4, h5, h6, p")).forEach((node) => items.push(node));
      if (!inner.children.length && (inner.textContent || "").trim()) {
        const p = document.createElement("p");
        p.textContent = inner.textContent.trim();
        items.push(p);
      }
    });
    const cells = [];
    if (logoImg) {
      cells.push([logoImg]);
    }
    const contentCell = document.createElement("div");
    if (playIcon) {
      const iconPara = document.createElement("p");
      iconPara.append(playIcon);
      contentCell.append(iconPara);
    }
    let i = 0;
    while (i < items.length) {
      const node = items[i];
      if (/^h[1-6]$/i.test(node.tagName)) {
        const runLevel = node.tagName.toLowerCase();
        const lines = [];
        while (i < items.length && /^h[1-6]$/i.test(items[i].tagName)) {
          const t = (items[i].textContent || "").trim();
          if (t.length) lines.push(t);
          i += 1;
        }
        const heading = document.createElement(runLevel);
        heading.innerHTML = lines.join("<br>");
        contentCell.append(heading);
      } else {
        contentCell.append(node);
        i += 1;
      }
    }
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-intro", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-positioning.js
  function parse2(element, { document }) {
    const columns = Array.from(element.querySelectorAll(":scope > .et_pb_column"));
    const rowCells = columns.map((column) => {
      const cellContent = [];
      const img = column.querySelector(".et_pb_image img, picture img, img");
      const textNodes = Array.from(
        column.querySelectorAll(".et_pb_text_inner > *, .et_pb_text_inner")
      ).filter((node) => node.matches("h1, h2, h3, h4, h5, h6, p"));
      if (textNodes.length) {
        cellContent.push(...textNodes);
      } else if (img) {
        cellContent.push(img);
      } else {
        const inner = column.querySelector(".et_pb_text_inner");
        if (inner) cellContent.push(inner);
      }
      const ctaLinks = Array.from(
        column.querySelectorAll(".stw_inline_button a, a.sw-btn__link, a[href]")
      );
      const seen = /* @__PURE__ */ new Set();
      ctaLinks.forEach((link) => {
        if (!seen.has(link)) {
          seen.add(link);
          cellContent.push(link);
        }
      });
      return cellContent.length ? cellContent : "";
    });
    const cells = [rowCells];
    const block = WebImporter.Blocks.createBlock(document, {
      name: "columns-positioning",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-leadership.js
  function buildContentCell(document, { href, quote, name, title }) {
    const anchor = document.createElement("a");
    if (href) anchor.setAttribute("href", href);
    if (quote) {
      const bq = document.createElement("blockquote");
      bq.textContent = quote;
      anchor.append(bq);
    }
    if (name) {
      const nameEl = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = name;
      nameEl.append(strong);
      anchor.append(nameEl);
    }
    if (title) {
      const titleEl = document.createElement("p");
      titleEl.textContent = title;
      anchor.append(titleEl);
    }
    if (!href) return [...anchor.childNodes];
    return [anchor];
  }
  function parse3(element, { document }) {
    const text = (el) => el ? el.textContent.replace(/\s+/g, " ").trim() : "";
    const featuredRoot = element.matches(".stw_featured_person") ? element.querySelector(".stw-featured-person") : element.querySelector(".stw-featured-person");
    if (featuredRoot || element.matches(".stw_featured_person")) {
      const root = featuredRoot || element;
      const image = root.querySelector(".image-wrapper img, img");
      const quote = text(root.querySelector(".quote"));
      const name = text(root.querySelector(".details .name, .name"));
      const title = text(root.querySelector(".details .position, .position"));
      const link = root.querySelector("a[href]");
      const href = link ? link.getAttribute("href") : null;
      if (!image && !name && !quote) {
        element.replaceWith(...element.childNodes);
        return;
      }
      const contentCell = buildContentCell(document, { href, quote, name, title });
      const cells2 = [[image || "", contentCell]];
      const block2 = WebImporter.Blocks.createBlock(document, {
        name: "carousel-leadership",
        cells: cells2
      });
      element.replaceWith(block2);
      return;
    }
    const personWrappers = Array.from(
      element.querySelectorAll(".stw-people-slider-item-wrapper")
    );
    const cells = [];
    personWrappers.forEach((wrapper) => {
      const item = wrapper.querySelector(".stw-people-slider-item") || wrapper;
      const image = item.querySelector(".image-wrapper img, img");
      const name = text(item.querySelector(".details .name, .name"));
      const title = text(item.querySelector(".details .position, .position"));
      const link = wrapper.querySelector("a[href]");
      const href = link ? link.getAttribute("href") : null;
      if (!image && !name) return;
      const contentCell = buildContentCell(document, { href, quote: "", name, title });
      cells.push([image || "", contentCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, {
      name: "carousel-leadership",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-capabilities.js
  function parse4(element, { document }) {
    const slideItems = Array.from(
      element.querySelectorAll(".et_pb_dp_dmb_module_820_item")
    ).filter((item) => !item.closest(".slick-cloned"));
    const cells = [["Carousel (capabilities)"]];
    const seenIndexes = /* @__PURE__ */ new Set();
    slideItems.forEach((item) => {
      const indexEl = item.querySelector(".stagwell-main-slider__index");
      const nameEl = item.querySelector(".stagwell-main-slider__name");
      const textEl = item.querySelector(".stagwell-main-slider__text");
      const imageEl = item.querySelector("img.stagwell-main-slider__image, .stagwell-main-slider__image-wrap img");
      const indexKey = indexEl ? indexEl.textContent.trim() : "";
      if (!indexKey || seenIndexes.has(indexKey)) return;
      seenIndexes.add(indexKey);
      const imageCell = imageEl || "";
      const contentCell = [];
      if (indexEl) contentCell.push(indexEl);
      if (nameEl) contentCell.push(nameEl);
      if (textEl) contentCell.push(textEl);
      cells.push([imageCell, contentCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, {
      name: "carousel-capabilities",
      cells
    });
    const fragment = document.createDocumentFragment();
    const titleEl = element.querySelector(".stagwell-main-slider__title");
    if (titleEl) {
      const heading = document.createElement("h2");
      heading.innerHTML = titleEl.innerHTML;
      fragment.append(heading);
    }
    const introTextEl = element.querySelector(".stagwell-main-slider__static .stagwell-main-slider__text");
    if (introTextEl) {
      introTextEl.querySelectorAll("p").forEach((p) => {
        const text = p.textContent.trim();
        if (text) {
          const para = document.createElement("p");
          para.textContent = text;
          fragment.append(para);
        }
      });
      const list = introTextEl.querySelector("ul");
      if (list) {
        const ul = document.createElement("ul");
        list.querySelectorAll("li").forEach((li) => {
          const item = document.createElement("li");
          item.textContent = li.textContent.trim();
          ul.append(item);
        });
        fragment.append(ul);
      }
    }
    fragment.append(block);
    element.replaceWith(fragment);
  }

  // tools/importer/parsers/cards-stats.js
  function parse5(element, { document }) {
    const statModules = Array.from(
      element.querySelectorAll(":scope > .et_pb_text, :scope .et_pb_text")
    );
    const cells = [];
    statModules.forEach((module) => {
      const inner = module.querySelector(".et_pb_text_inner") || module;
      const number = inner.querySelector("h1, h2, h3, h4, h5, h6");
      const label = number ? inner.querySelector(
        "h1, h2, h3, h4, h5, h6 ~ h1, h2, h3, h4, h5, h6"
      ) : null;
      const headings = Array.from(inner.querySelectorAll("h1, h2, h3, h4, h5, h6"));
      const body = headings.length ? headings : [];
      if (body.length) {
        cells.push([body]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-stats", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/form.js
  function parse6(element, { document }) {
    const formContainer = element.matches(".hbspt-form") ? element : element.querySelector(".hbspt-form");
    const containerId = formContainer ? formContainer.getAttribute("id") || "" : "";
    const iframe = element.querySelector('iframe.hs-form-iframe, iframe[id^="hs-form-iframe"], iframe');
    const iframeSrc = iframe ? iframe.getAttribute("src") || iframe.getAttribute("data-src") || "" : "";
    const formRef = iframeSrc || containerId;
    const cellContent = document.createElement("div");
    if (formRef) {
      const refPara = document.createElement("p");
      if (iframeSrc) {
        const link = document.createElement("a");
        link.href = iframeSrc;
        link.textContent = iframeSrc;
        refPara.append(link);
      } else {
        refPara.textContent = formRef;
      }
      cellContent.append(refPara);
    }
    const cells = [[cellContent]];
    const block = WebImporter.Blocks.createBlock(document, { name: "form", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/stagwell-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [".slick-cloned"]);
      WebImporter.DOMUtils.remove(element, [
        ".stagwell-main-slider__arrow",
        ".stagwell-main-slider__numbering",
        ".stagwell-main-slider__details"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".stw-people-slider-controls",
        ".stw-people-slider-count-container"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header#header",
        "nav.nav-header",
        "footer#footer",
        "nav.nav-footer",
        "#react-portal"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "iframe",
        "noscript",
        "link",
        "source"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("onclick");
        el.removeAttribute("data-slick-index");
        el.removeAttribute("aria-hidden");
        el.removeAttribute("tabindex");
        el.removeAttribute("role");
      });
    }
  }

  // tools/importer/transformers/stagwell-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName !== TransformHook2.afterTransform) return;
    const template = payload && payload.template;
    const sections = template && Array.isArray(template.sections) ? template.sections : [];
    if (sections.length < 2) return;
    const doc = element.ownerDocument;
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section || !section.selector) continue;
      const el = element.querySelector(section.selector);
      if (!el) continue;
      if (section.style) {
        const metaBlock = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        if (el.nextSibling) {
          el.parentNode.insertBefore(metaBlock, el.nextSibling);
        } else {
          el.parentNode.appendChild(metaBlock);
        }
      }
      if (i > 0) {
        el.parentNode.insertBefore(doc.createElement("hr"), el);
      }
    }
  }

  // tools/importer/import-about-page.js
  var parsers = {
    "hero-intro": parse,
    "columns-positioning": parse2,
    "carousel-leadership": parse3,
    "carousel-capabilities": parse4,
    "cards-stats": parse5,
    form: parse6
  };
  var PAGE_TEMPLATE = {
    name: "about-page",
    description: "Stagwell About Us page with hero intro, our story, executive leadership, capabilities carousel, challenger stats, impact, contact, and newsletter",
    urls: ["https://www.stagwellglobal.com/about-us/"],
    blocks: [
      { name: "hero-intro", instances: [".et_pb_section_0"] },
      { name: "columns-positioning", instances: [".et_pb_section_1 .et_pb_row_1", ".et_pb_section_7 .et_pb_row_7"] },
      { name: "carousel-leadership", instances: [".et_pb_section_3 .stw_featured_person", ".et_pb_section_3 .stw_people_slider"] },
      { name: "carousel-capabilities", instances: [".et_pb_section_4 .stagwell-main-slider"] },
      { name: "cards-stats", instances: ["#sw-featured-stats .et_pb_column_8"] },
      { name: "form", instances: [".hbspt-form"] },
      { name: "section-capabilities", instances: [".et_pb_section_4"], section: "dark" },
      { name: "section-challenger", instances: ["#sw-featured-stats"], section: "grey" },
      { name: "section-newsletter", instances: [".et_pb_section_9"], section: "accent" }
    ],
    sections: [
      { id: "section-1", name: "Hero Intro", selector: ".et_pb_section_0", style: "light", blocks: ["hero-intro"], defaultContent: [] },
      { id: "section-2", name: "Our Story", selector: ".et_pb_section_1", style: "light", blocks: ["columns-positioning"], defaultContent: [] },
      { id: "section-3", name: "Accelerating Change", selector: ".et_pb_section_2", style: "light", blocks: [], defaultContent: [".et_pb_section_2 .et_pb_text_inner"] },
      { id: "section-4", name: "Executive Leadership", selector: ".et_pb_section_3", style: "light", blocks: ["carousel-leadership"], defaultContent: [".et_pb_text_7", ".et_pb_text_8"] },
      { id: "section-5", name: "Our Capabilities", selector: ".et_pb_section_4", style: "dark", blocks: ["carousel-capabilities"], defaultContent: [] },
      { id: "section-6", name: "Spacer", selector: ".et_pb_section_5", style: "light", blocks: [], defaultContent: [] },
      { id: "section-7", name: "Challenger Marketing Network", selector: "#sw-featured-stats", style: "grey", blocks: ["cards-stats"], defaultContent: [".et_pb_text_9", ".et_pb_text_10", ".et_pb_text_11"] },
      { id: "section-8", name: "Our Impact", selector: ".et_pb_section_7", style: "light", blocks: ["columns-positioning"], defaultContent: [] },
      { id: "section-9", name: "Contact Us", selector: "#sw-contact-us", style: "light", blocks: [], defaultContent: [".et_pb_text_24", ".et_pb_text_25"] },
      { id: "section-10", name: "Newsletter Sign Up", selector: ".et_pb_section_9", style: "accent", blocks: ["form"], defaultContent: [".et_pb_text_26"] }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.filter((blockDef) => !blockDef.name.startsWith("section-")).forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_about_page_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const pathname = new URL(params.originalURL).pathname.replace(/\.html$/, "").replace(/\/$/, "");
      const localized = `/en${pathname || "/index"}`;
      const path = WebImporter.FileUtils.sanitizePath(localized);
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_about_page_exports);
})();
