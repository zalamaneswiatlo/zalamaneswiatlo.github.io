(function () {
  var lightbox = document.getElementById("blogLightbox");
  var lbClose = document.getElementById("blogLbClose");
  var lbPrev = document.getElementById("blogLbPrev");
  var lbNext = document.getElementById("blogLbNext");
  var lbImg = document.getElementById("blogLbImg");
  var lbFilmstrip = document.getElementById("blogLbFilmstrip");
  if (!lightbox || !lbClose || !lbPrev || !lbNext || !lbImg || !lbFilmstrip) return;

  var urls = [];
  var index = 0;
  var imageFullscreen = false;
  var returnFocus = null;

  function collectImages(post) {
    var media = post.querySelector(".post-media");
    if (!media) return [];
    return Array.prototype.slice.call(media.querySelectorAll("img"))
      .map(function (im) { return im.getAttribute("src") || ""; })
      .filter(Boolean);
  }

  function setBodyScrollLock() {
    document.body.style.overflow = lightbox.hidden ? "" : "hidden";
  }

  function setImageFullscreen(enabled) {
    imageFullscreen = !!enabled;
    lightbox.classList.toggle("is-image-fullscreen", imageFullscreen);
  }

  function clearFilmstrip() {
    lbFilmstrip.hidden = true;
    lbFilmstrip.innerHTML = "";
  }

  function renderFilmstrip() {
    var count = urls.length;
    if (count <= 1) {
      clearFilmstrip();
      return;
    }
    lbFilmstrip.hidden = false;
    lbFilmstrip.innerHTML = "";
    urls.forEach(function (src, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "blog-lightbox__filmstrip-item";
      btn.setAttribute("aria-selected", i === index ? "true" : "false");
      btn.setAttribute("aria-label", "Zdjęcie " + (i + 1) + " z " + count);
      if (i === index) btn.classList.add("is-active");
      var im = document.createElement("img");
      im.src = src;
      im.alt = "";
      im.loading = "lazy";
      btn.appendChild(im);
      btn.addEventListener("click", function () {
        index = i;
        syncSlide();
      });
      lbFilmstrip.appendChild(btn);
    });
    var activeBtn = lbFilmstrip.children[index];
    if (activeBtn && activeBtn.scrollIntoView) {
      activeBtn.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    }
  }

  function syncSlide() {
    var count = urls.length;
    if (!count) {
      lbImg.removeAttribute("src");
      lbImg.alt = "";
      lbPrev.disabled = true;
      lbNext.disabled = true;
      clearFilmstrip();
      return;
    }
    var last = count - 1;
    index = Math.max(0, Math.min(index, last));
    lbImg.src = urls[index];
    lbImg.alt = "Zdjęcie " + (index + 1);
    var oneOrNone = count <= 1;
    lbPrev.disabled = oneOrNone;
    lbNext.disabled = oneOrNone;
    renderFilmstrip();
  }

  function openGallery(post, startSrc) {
    urls = collectImages(post);
    if (!urls.length) return;
    var start = startSrc ? urls.indexOf(startSrc) : 0;
    index = start >= 0 ? start : 0;
    setImageFullscreen(false);
    returnFocus = document.activeElement;
    lightbox.hidden = false;
    setBodyScrollLock();
    syncSlide();
    lbClose.focus();
  }

  function closeGallery() {
    setImageFullscreen(false);
    lightbox.hidden = true;
    setBodyScrollLock();
    lbImg.removeAttribute("src");
    urls = [];
    clearFilmstrip();
    if (returnFocus && typeof returnFocus.focus === "function") {
      returnFocus.focus();
    }
  }

  function showPrev() {
    if (!urls.length) return;
    index = index > 0 ? index - 1 : urls.length - 1;
    syncSlide();
  }

  function showNext() {
    if (!urls.length) return;
    index = index < urls.length - 1 ? index + 1 : 0;
    syncSlide();
  }


  document.querySelectorAll(".post-media img").forEach(function (thumb) {
    thumb.addEventListener("click", function (e) {
      e.stopPropagation();
      var post = thumb.closest(".post");
      if (!post) return;
      openGallery(post, thumb.getAttribute("src"));
    });
  });

  lbClose.addEventListener("click", closeGallery);
  lbPrev.addEventListener("click", showPrev);
  lbNext.addEventListener("click", showNext);
  lbImg.addEventListener("click", function () {
    setImageFullscreen(!imageFullscreen);
  });

  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeGallery();
  });

  document.addEventListener("keydown", function (e) {
    if (lightbox.hidden) return;
    if (e.key === "Escape") {
      e.preventDefault();
      if (imageFullscreen) {
        setImageFullscreen(false);
      } else {
        closeGallery();
      }
      return;
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      showPrev();
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      showNext();
    }
  });
})();
