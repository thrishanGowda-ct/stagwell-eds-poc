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

  // tools/importer/import-augmented-reality.js
  var import_augmented_reality_exports = {};
  __export(import_augmented_reality_exports, {
    default: () => import_augmented_reality_default
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
      const testimonial = column.querySelector(".et_pb_testimonial");
      if (testimonial) {
        const quoteText = testimonial.querySelector(
          ".et_pb_testimonial_content, blockquote, p"
        );
        const author = testimonial.querySelector(".et_pb_testimonial_author");
        if (quoteText && (quoteText.textContent || "").trim()) {
          const bq = document.createElement("blockquote");
          bq.innerHTML = quoteText.innerHTML;
          cellContent.push(bq);
        }
        if (author && (author.textContent || "").trim()) {
          const cite = document.createElement("p");
          cite.innerHTML = `<em>${author.textContent.trim()}</em>`;
          cellContent.push(cite);
        }
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

  // tools/importer/parsers/cards-feature.js
  function parse3(element, { document }) {
    const cells = [];
    const headings = Array.from(element.querySelectorAll("h1, h2, h3, h4, h5, h6"));
    if (headings.length <= 1) {
      const image = element.querySelector(".et_pb_image img, img");
      const heading = headings[0] || null;
      const paragraphs = Array.from(
        element.querySelectorAll(".et_pb_text .et_pb_text_inner p, .et_pb_text_inner p, p")
      );
      const body = [];
      if (heading) body.push(heading);
      paragraphs.forEach((p) => body.push(p));
      if (image || body.length) {
        cells.push([image || "", body.length ? body : ""]);
      }
    } else {
      const columns = Array.from(element.querySelectorAll(":scope > .et_pb_column"));
      columns.forEach((column) => {
        const image = column.querySelector(".et_pb_image img, img");
        const heading = column.querySelector("h1, h2, h3, h4, h5, h6");
        const paragraphs = Array.from(
          column.querySelectorAll(".et_pb_text .et_pb_text_inner p, .et_pb_text_inner p, p")
        );
        const body = [];
        if (heading) body.push(heading);
        paragraphs.forEach((p) => body.push(p));
        if (image || body.length) {
          cells.push([image || "", body.length ? body : ""]);
        }
      });
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-stats.js
  function parse4(element, { document }) {
    const statModules = Array.from(
      element.querySelectorAll(":scope > .et_pb_text, :scope .et_pb_text")
    );
    const isEmptyParagraph = (node) => {
      if (node.tagName !== "P") return false;
      const text = (node.textContent || "").replace(/ /g, " ").trim();
      return text.length === 0;
    };
    const cells = [];
    statModules.forEach((module) => {
      const inner = module.querySelector(".et_pb_text_inner") || module;
      const content = Array.from(
        inner.querySelectorAll("h1, h2, h3, h4, h5, h6, p")
      ).filter((node) => !isEmptyParagraph(node));
      if (content.length) {
        cells.push([content]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-stats", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/form.js
  function parse5(element, { document }) {
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

  // tools/importer/import-augmented-reality.js
  var parsers = {
    "hero-intro": parse,
    "columns-positioning": parse2,
    "cards-feature": parse3,
    "cards-stats": parse4,
    form: parse5
  };
  var PAGE_TEMPLATE = {
    name: "augmented-reality",
    description: "Stagwell Augmented Reality marketing-frontiers page: hero intro, intro copy, AR tech feature quote, three AR article cards, Data Corner stats, contact, and newsletter",
    urls: ["https://www.stagwellglobal.com/augmented-reality/"],
    blocks: [
      { name: "hero-intro", instances: [".et_pb_section_0 .et_pb_row_0"] },
      { name: "columns-positioning", instances: [".et_pb_section_0 .et_pb_row_2"] },
      { name: "cards-feature", instances: [".et_pb_section_0 .et_pb_row_4", ".et_pb_section_0 .et_pb_row_6", ".et_pb_section_0 .et_pb_row_8"] },
      { name: "cards-stats", instances: [".et_pb_section_1 .et_pb_column_19"] },
      { name: "form", instances: [".hbspt-form"] },
      { name: "section-newsletter", instances: [".et_pb_section_4"], section: "accent" }
    ],
    sections: [
      { id: "section-1", name: "Hero Intro", selector: ".et_pb_section_0 .et_pb_row_0", style: "light", blocks: ["hero-intro"], defaultContent: [] },
      { id: "section-2", name: "Intro Copy", selector: ".et_pb_section_0 .et_pb_row_1", style: "light", blocks: [], defaultContent: [".et_pb_section_0 .et_pb_row_1 .et_pb_text_inner"] },
      { id: "section-3", name: "Our AR Tech in Action", selector: ".et_pb_section_0 .et_pb_row_2", style: "light", blocks: ["columns-positioning"], defaultContent: [] },
      { id: "section-4", name: "AR Article Cards", selector: ".et_pb_section_0 .et_pb_row_4", style: "light", blocks: ["cards-feature"], defaultContent: [] },
      { id: "section-5", name: "Data Corner", selector: ".et_pb_section_1", style: "light", blocks: ["cards-stats"], defaultContent: [] },
      { id: "section-6", name: "Contact Us", selector: "#sw-contact-us", style: "light", blocks: [], defaultContent: [] },
      { id: "section-7", name: "Newsletter Sign Up", selector: ".et_pb_section_4", style: "accent", blocks: ["form"], defaultContent: [] }
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
  var import_augmented_reality_default = {
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
  return __toCommonJS(import_augmented_reality_exports);
})();
