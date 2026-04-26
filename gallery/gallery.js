(function () {
  var COLLECTIONS = Array.isArray(window.PG_COLLECTIONS) ? window.PG_COLLECTIONS : [];

  function isBranch(col) {
    return Array.isArray(col.items) && col.items.length > 0;
  }

  function photoSrc(entry) {
    return typeof entry === "string" ? entry : entry.src;
  }

  var root = document.getElementById("photo-gallery-embed");
  if (!root) return;

  var mosaic = document.getElementById("pg-mosaic");
  var branchEl = document.getElementById("pg-branch");
  var branchBack = document.getElementById("pg-branch-back");
  var branchTitle = document.getElementById("pg-branch-title");
  var branchIntro = document.getElementById("pg-branch-intro");
  var branchGrid = document.getElementById("pg-branch-grid");
  var lightbox = document.getElementById("pg-lightbox");
  var lbClose = document.getElementById("pg-lb-close");
  var lbPrev = document.getElementById("pg-lb-prev");
  var lbNext = document.getElementById("pg-lb-next");
  var lbImg = document.getElementById("pg-lb-img");
  var lbFilmstrip = document.getElementById("pg-lb-filmstrip");
  var lbTitle = document.getElementById("pg-lb-title");
  var lbText = document.getElementById("pg-lb-text");
  var lbCurator = document.getElementById("pg-lb-curator");

  var activeLeaf = null;
  var slideIndex = 0;
  var lightboxReturnFocus = null;
  var branchReturnFocus = null;
  var imageFullscreen = false;

  function setBodyScrollLock() {
    var lock = !lightbox.hidden || !branchEl.hidden;
    document.body.style.overflow = lock ? "hidden" : "";
  }

  function setImageFullscreen(enabled) {
    imageFullscreen = !!enabled;
    lightbox.classList.toggle("is-image-fullscreen", imageFullscreen);
  }

  function toggleImageFullscreen() {
    setImageFullscreen(!imageFullscreen);
  }

  function openGallery(leaf) {
    if (!leaf || !Array.isArray(leaf.photos)) return;
    activeLeaf = leaf;
    slideIndex = 0;
    setImageFullscreen(false);
    // fullStageLightbox: zob. .cursor/rules/gallery-lightbox-layouts.mdc — false = panel tekstu, true = tylko tytuł + scena
    lightbox.classList.toggle("lightbox--full-stage", !!leaf.fullStageLightbox);
    lightboxReturnFocus = document.activeElement;
    lightbox.hidden = false;
    setBodyScrollLock();
    syncSlide();
    lbClose.focus();
  }

  function close() {
    setImageFullscreen(false);
    lightbox.classList.remove("lightbox--full-stage");
    lightbox.hidden = true;
    setBodyScrollLock();
    if (lightboxReturnFocus && typeof lightboxReturnFocus.focus === "function") {
      lightboxReturnFocus.focus();
    }
  }

  function openBranch(parentIndex) {
    var col = COLLECTIONS[parentIndex];
    if (!col || !isBranch(col)) return;
    branchReturnFocus = document.activeElement;
    branchTitle.textContent = col.title;
    branchIntro.textContent = col.text || "";
    branchGrid.textContent = "";

    col.items.forEach(function (item) {
      var li = document.createElement("li");
      li.className = "branch__item";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "branch__cell";
      btn.setAttribute("aria-label", "Otwórz galerię: " + item.title);
      var img = document.createElement("img");
      img.src = item.cover;
      img.alt = "";
      img.loading = "lazy";
      btn.appendChild(img);
      btn.addEventListener("click", function () {
        openGallery(item);
      });
      var cap = document.createElement("div");
      cap.className = "branch__label";
      cap.textContent = item.title;
      li.appendChild(btn);
      li.appendChild(cap);
      branchGrid.appendChild(li);
    });

    branchEl.hidden = false;
    setBodyScrollLock();
    branchBack.focus();
  }

  function closeBranch() {
    branchEl.hidden = true;
    branchGrid.textContent = "";
    setBodyScrollLock();
    if (branchReturnFocus && typeof branchReturnFocus.focus === "function") {
      branchReturnFocus.focus();
    }
  }

  function openRootItem(i) {
    var col = COLLECTIONS[i];
    if (!col) return;
    if (isBranch(col)) {
      openBranch(i);
    } else {
      openGallery(col);
    }
  }

  function renderThumbs() {
    mosaic.textContent = "";
    COLLECTIONS.forEach(function (col, i) {
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "thumb";
      var slot = typeof col.mosaicSlot === "number" ? col.mosaicSlot : i;
      btn.setAttribute("data-i", String(slot));
      var label = isBranch(col) ? "Otwórz: " + col.title + " (podserie)" : "Otwórz galerię: " + col.title;
      btn.setAttribute("aria-label", label);
      var img = document.createElement("img");
      img.src = col.cover;
      img.alt = "";
      img.loading = "lazy";
      btn.appendChild(img);
      btn.addEventListener("click", function () {
        openRootItem(i);
      });
      li.appendChild(btn);
      mosaic.appendChild(li);
    });
  }

  function currentPhotos() {
    return activeLeaf && activeLeaf.photos ? activeLeaf.photos : [];
  }

  function maxSlideIndex() {
    var n = currentPhotos().length;
    return n > 0 ? n - 1 : -1;
  }

  function clearFilmstrip() {
    if (!lbFilmstrip) return;
    lbFilmstrip.hidden = true;
    lbFilmstrip.innerHTML = "";
  }

  function renderFilmstrip() {
    if (!lbFilmstrip) return;
    var photos = currentPhotos();
    var n = photos.length;
    if (n <= 1) {
      clearFilmstrip();
      return;
    }
    lbFilmstrip.hidden = false;
    lbFilmstrip.innerHTML = "";
    photos.forEach(function (p, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "lightbox__filmstrip-item";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", i === slideIndex ? "true" : "false");
      b.setAttribute("aria-label", "Zdjęcie " + (i + 1) + " z " + n);
      if (i === slideIndex) b.classList.add("is-active");
      var im = document.createElement("img");
      im.src = photoSrc(p);
      im.alt = "";
      im.loading = "lazy";
      b.appendChild(im);
      b.addEventListener("click", function () {
        slideIndex = i;
        syncSlide();
      });
      lbFilmstrip.appendChild(b);
    });
    var activeBtn = lbFilmstrip.children[slideIndex];
    if (activeBtn && activeBtn.scrollIntoView) {
      activeBtn.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    }
  }

  function syncSlide() {
    var col = activeLeaf;
    var photos = currentPhotos();
    var n = photos.length;
    var last = maxSlideIndex();

    if (!col || n === 0) {
      lbImg.removeAttribute("src");
      lbImg.alt = "";
      lbTitle.textContent = col ? col.title : "";
      lbText.textContent = col ? col.text || "" : "";
      if (lbCurator) {
        lbCurator.textContent = "";
        lbCurator.hidden = true;
      }
      lbPrev.disabled = true;
      lbNext.disabled = true;
      clearFilmstrip();
      return;
    }

    slideIndex = Math.max(0, Math.min(slideIndex, last));

    lbTitle.textContent = col.title;
    lbText.textContent = col.text || "";
    if (lbCurator) {
      var cf = col.curatorFooter;
      if (cf) {
        lbCurator.textContent = cf;
        lbCurator.hidden = false;
      } else {
        lbCurator.textContent = "";
        lbCurator.hidden = true;
      }
    }
    lbImg.src = photoSrc(photos[slideIndex]);
    lbImg.alt = col.title;

    var oneOrNone = n <= 1;
    lbPrev.disabled = oneOrNone;
    lbNext.disabled = oneOrNone;

    renderFilmstrip();
  }

  function showPrev() {
    var last = maxSlideIndex();
    if (last < 0) return;
    slideIndex = slideIndex > 0 ? slideIndex - 1 : last;
    syncSlide();
  }

  function showNext() {
    var last = maxSlideIndex();
    if (last < 0) return;
    slideIndex = slideIndex < last ? slideIndex + 1 : 0;
    syncSlide();
  }


  branchBack.addEventListener("click", closeBranch);

  lbClose.addEventListener("click", close);
  lbPrev.addEventListener("click", showPrev);
  lbNext.addEventListener("click", showNext);
  lbImg.addEventListener("click", toggleImageFullscreen);

  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) close();
  });

  document.addEventListener("keydown", function (e) {
    if (!lightbox.hidden) {
      if (e.key === "Escape") {
        if (imageFullscreen) {
          e.preventDefault();
          setImageFullscreen(false);
          return;
        }
        e.preventDefault();
        close();
      }
      var last = maxSlideIndex();
      if (last < 0) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        showPrev();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        showNext();
      }
      return;
    }

    if (!branchEl.hidden && e.key === "Escape") {
      e.preventDefault();
      closeBranch();
    }
  });

  renderThumbs();
})();
