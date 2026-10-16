/**
 * The Selection Blueprint — Interactive Features & GSAP Animations
 * Brand: CountryEdu | Career Development Programs
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Accessibility: Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* =========================================================
     1.1 HOLOGRAPHIC FORESTGREEN LAVA BACKGROUND TEXTURE
     ========================================================= */
  const initHolographicLava = () => {
    const canvas = document.getElementById("holographicLavaCanvas");
    if (!canvas) return;

    let gl = null;
    try {
      gl = canvas.getContext("webgl", { powerPreference: "low-power", antialias: false, alpha: false }) ||
           canvas.getContext("experimental-webgl", { powerPreference: "low-power", antialias: false, alpha: false });
    } catch (e) {
      gl = null;
    }

    if (!gl) {
      init2DFallback(canvas);
      return;
    }

    const vsSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;

      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
        m = m * m;
        m = m * m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      float fbm(vec2 p) {
        float f = 0.0;
        float w = 0.5;
        for (int i = 0; i < 4; i++) {
          f += w * snoise(p);
          p *= 2.05;
          w *= 0.5;
        }
        return f;
      }

      void main() {
        vec2 st = gl_FragCoord.xy / u_resolution.xy;
        st.x *= u_resolution.x / u_resolution.y;

        float t = u_time * 0.06;
        vec2 mouseOffset = (u_mouse - 0.5) * 0.15;
        st += mouseOffset;

        vec2 q = vec2(
          fbm(st + vec2(0.0, t * 0.8)),
          fbm(st + vec2(1.3, 1.7) + vec2(t * 0.6, 0.0))
        );

        vec2 r = vec2(
          fbm(st + 1.35 * q + vec2(2.4, 4.1) + vec2(0.0, t * 1.1)),
          fbm(st + 1.25 * q + vec2(8.1, 2.9) + vec2(t * 0.9, 0.0))
        );

        float f = fbm(st + 1.5 * r);

        vec3 forestDeep = vec3(0.024, 0.075, 0.055);
        vec3 forestPine = vec3(0.067, 0.231, 0.153);
        vec3 forestEmerald = vec3(0.125, 0.420, 0.282);
        vec3 forestLava = vec3(0.247, 0.667, 0.455);
        vec3 mintGlow = vec3(0.510, 0.812, 0.584);

        vec3 color = mix(forestDeep, forestPine, clamp((f + 0.3) * 0.8, 0.0, 1.0));
        color = mix(color, forestEmerald, clamp(length(q) * 0.75, 0.0, 1.0));
        color = mix(color, forestLava, clamp(pow(r.x + 0.2, 2.5) * 1.2, 0.0, 1.0));
        color = mix(color, mintGlow, clamp(pow(max(0.0, f), 3.0) * 1.4, 0.0, 1.0));

        float holoPhase = f * 5.5 + r.x * 3.2 + t * 1.5;
        vec3 holoTint = mix(
          vec3(0.25, 0.85, 0.75),
          vec3(0.68, 0.48, 0.92),
          sin(holoPhase * 1.2) * 0.5 + 0.5
        );
        holoTint = mix(holoTint, vec3(0.85, 0.72, 0.35), cos(holoPhase * 0.8) * 0.5 + 0.5);

        float ridge = 1.0 - abs(snoise(st * 2.5 + r) * 1.8);
        float holoStrength = pow(clamp(ridge, 0.0, 1.0), 3.0) * 0.28;
        color += holoTint * holoStrength;

        float vein = pow(clamp(1.0 - abs(r.y - 0.45) * 3.5, 0.0, 1.0), 4.0);
        color += mintGlow * vein * 0.35;

        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        float vignette = uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
        vignette = clamp(pow(16.0 * vignette, 0.25), 0.0, 1.0);
        color *= (0.65 + 0.35 * vignette);

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const createShader = (type, src) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn("Shader error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = createShader(gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) {
      init2DFallback(canvas);
      return;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("Program link error:", gl.getProgramInfoLog(program));
      init2DFallback(canvas);
      return;
    }

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1
      ]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(program, "a_position");
    const uRes = gl.getUniformLocation(program, "u_resolution");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uMouse = gl.getUniformLocation(program, "u_mouse");

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * 0.65;
    const handleResize = () => {
      const w = Math.max(320, Math.floor(window.innerWidth * dpr));
      const h = Math.max(320, Math.floor(window.innerHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };
    window.addEventListener("resize", handleResize, { passive: true });
    handleResize();

    let mouseX = 0.5, mouseY = 0.5;
    let targetMouseX = 0.5, targetMouseY = 0.5;
    window.addEventListener("mousemove", (e) => {
      targetMouseX = e.clientX / window.innerWidth;
      targetMouseY = 1.0 - (e.clientY / window.innerHeight);
    }, { passive: true });

    const startTime = performance.now();
    const speed = prefersReducedMotion ? 0.015 : 1.0;

    const render = (now) => {
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      const elapsed = ((now - startTime) / 1000) * speed;

      gl.useProgram(program);
      gl.enableVertexAttribArray(aPos);
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, elapsed);
      gl.uniform2f(uMouse, mouseX, mouseY);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
  };

  const init2DFallback = (canvas) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize2D = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize2D, { passive: true });
    resize2D();

    let t = 0;
    const draw2D = () => {
      t += prefersReducedMotion ? 0.001 : 0.008;
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = "#040e0b";
      ctx.fillRect(0, 0, w, h);

      const g1 = ctx.createRadialGradient(
        w * (0.35 + 0.25 * Math.sin(t * 0.7)),
        h * (0.35 + 0.2 * Math.cos(t * 0.6)),
        0,
        w * 0.4,
        h * 0.4,
        w * 0.6
      );
      g1.addColorStop(0, "rgba(32, 107, 72, 0.45)");
      g1.addColorStop(0.5, "rgba(17, 59, 39, 0.25)");
      g1.addColorStop(1, "transparent");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, w, h);

      const g2 = ctx.createRadialGradient(
        w * (0.65 + 0.2 * Math.cos(t * 0.5)),
        h * (0.65 + 0.25 * Math.sin(t * 0.8)),
        0,
        w * 0.6,
        h * 0.6,
        w * 0.65
      );
      g2.addColorStop(0, "rgba(63, 170, 116, 0.35)");
      g2.addColorStop(0.6, "rgba(130, 207, 149, 0.12)");
      g2.addColorStop(1, "transparent");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, w, h);

      requestAnimationFrame(draw2D);
    };
    requestAnimationFrame(draw2D);
  };

  initHolographicLava();

  /* =========================================================
     2. NAVBAR SCROLL EFFECT & MOBILE MENU TOGGLE
     ========================================================= */
  const navbar = document.getElementById("navbar");
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");
  const navLinks = document.querySelectorAll(".nav-link, .nav-cta");

  // Sticky header background state on scroll
  const handleScroll = () => {
    if (window.scrollY > 35) {
      navbar?.classList.add("scrolled");
    } else {
      navbar?.classList.remove("scrolled");
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  // Mobile menu toggle
  if (navToggle && navMenu) {
    const toggleMenu = (open) => {
      const isOpen = open !== undefined ? open : navMenu.classList.contains("is-active");
      if (isOpen) {
        navMenu.classList.remove("is-active");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      } else {
        navMenu.classList.add("is-active");
        navToggle.setAttribute("aria-expanded", "true");
        document.body.style.overflow = "hidden";
      }
    };

    navToggle.addEventListener("click", () => {
      const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
      toggleMenu(isExpanded);
    });

    // Close menu when navigation link is clicked
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        toggleMenu(true);
      });
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navMenu.classList.contains("is-active")) {
        toggleMenu(true);
      }
    });
  }

  /* =========================================================
     3. FAQ ACCORDION INTERACTION
     ========================================================= */
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const trigger = item.querySelector(".faq-trigger");
    const content = item.querySelector(".faq-content");

    if (trigger && content) {
      trigger.addEventListener("click", () => {
        const isExpanded = trigger.getAttribute("aria-expanded") === "true";

        // Close other accordion items for clean accordion UX
        faqItems.forEach((sibling) => {
          if (sibling !== item) {
            sibling.classList.remove("is-open");
            const siblingBtn = sibling.querySelector(".faq-trigger");
            const siblingContent = sibling.querySelector(".faq-content");
            if (siblingBtn) siblingBtn.setAttribute("aria-expanded", "false");
            if (siblingContent) siblingContent.setAttribute("hidden", "");
          }
        });

        // Toggle current
        if (isExpanded) {
          trigger.setAttribute("aria-expanded", "false");
          content.setAttribute("hidden", "");
          item.classList.remove("is-open");
        } else {
          trigger.setAttribute("aria-expanded", "true");
          content.removeAttribute("hidden");
          item.classList.add("is-open");
        }
      });
    }
  });

  /* =========================================================
     4. LIVE COUNTDOWN TIMER (24 OCTOBER 2026 · 5:00 PM IST)
     ========================================================= */
  const timerDaysEl = document.getElementById("timerDays");
  const timerHoursEl = document.getElementById("timerHours");
  const timerMinsEl = document.getElementById("timerMins");
  const timerSecsEl = document.getElementById("timerSecs");

  if (timerDaysEl && timerHoursEl && timerMinsEl && timerSecsEl) {
    const targetDate = new Date("2026-10-24T17:00:00+05:30").getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance <= 0) {
        timerDaysEl.textContent = "00";
        timerHoursEl.textContent = "00";
        timerMinsEl.textContent = "00";
        timerSecsEl.textContent = "00";
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      timerDaysEl.textContent = String(days).padStart(2, "0");
      timerHoursEl.textContent = String(hours).padStart(2, "0");
      timerMinsEl.textContent = String(minutes).padStart(2, "0");
      timerSecsEl.textContent = String(seconds).padStart(2, "0");
    };

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  /* =========================================================
     5. POLICY MODAL DIALOGS (Privacy, Terms, Integrity)
     ========================================================= */
  const policyModal = document.getElementById("policyModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const modalOkBtn = document.getElementById("modalOkBtn");
  const modalLinks = document.querySelectorAll(".modal-open-link");

  const policyContents = {
    privacy: {
      title: "Privacy Policy",
      body: "<p>At CountryEdu, we respect your confidentiality. Personal details collected during seminar registration (including name, academic standing, and contact info) are utilized strictly for seminar logistics, verified credentials, and educational resource distribution. We never trade, sell, or disclose your contact information to unapproved third parties.</p>"
    },
    terms: {
      title: "Terms & Conditions",
      body: "<p>Participation in 'The Selection Blueprint' seminar is provided for educational and career advancement purposes. All seminar slides, frameworks, and resource materials are proprietary intellectual property of CountryEdu and its authorized partners. Reproduction or unauthorized redistribution without permission is strictly prohibited.</p>"
    },
    ethics: {
      title: "Academic & Career Integrity Policy",
      body: "<p>CountryEdu is committed to promoting authentic, merit-based career readiness. Our frameworks encourage genuine self-representation, truthful narrative construction, and verifiable demonstration of competence during corporate hiring procedures.</p>"
    }
  };

  const openModal = (type) => {
    const data = policyContents[type] || policyContents.privacy;
    if (modalTitle) modalTitle.textContent = data.title;
    if (modalBody) modalBody.innerHTML = data.body;
    if (policyModal) {
      policyModal.classList.add("is-visible");
      policyModal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }
  };

  const closeModal = () => {
    if (policyModal) {
      policyModal.classList.remove("is-visible");
      policyModal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
  };

  modalLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const type = link.getAttribute("data-modal");
      openModal(type);
    });
  });

  modalCloseBtn?.addEventListener("click", closeModal);
  modalOkBtn?.addEventListener("click", closeModal);

  policyModal?.addEventListener("click", (e) => {
    if (e.target === policyModal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && policyModal?.classList.contains("is-visible")) {
      closeModal();
    }
  });

  /* =========================================================
     6. GSAP 3 & SCROLLTRIGGER ANIMATIONS
     ========================================================= */
  // Graceful degradation: Check if GSAP and ScrollTrigger are loaded
  if (typeof gsap === "undefined") {
    console.warn("GSAP library not loaded. Falling back to native CSS presentation.");
    return;
  }

  // Register ScrollTrigger plugin if available
  if (typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  // If user prefers reduced motion, skip transformative GSAP animations
  if (prefersReducedMotion) {
    return;
  }

  try {
    // 6.1 Hero Entrance Sequence Timeline
    const heroTl = gsap.timeline({
      defaults: { ease: "power3.out", duration: 0.85 }
    });

    heroTl
      .from(".hero-eyebrow", {
        y: 20,
        opacity: 0,
        duration: 0.65
      })
      .from(
        ".hero-title",
        {
          y: 40,
          opacity: 0,
          duration: 0.95
        },
        "-=0.4"
      )
      .from(
        ".hero-highlight",
        {
          y: 25,
          opacity: 0,
          duration: 0.75
        },
        "-=0.55"
      )
      .from(
        ".hero-description",
        {
          y: 20,
          opacity: 0,
          duration: 0.7
        },
        "-=0.5"
      )
      .from(
        ".hero-meta-bar",
        {
          y: 18,
          opacity: 0,
          duration: 0.65
        },
        "-=0.45"
      )
      // fromTo + explicit end values: .btn has a CSS `transition: all`, which makes a
      // plain .from() freeze at its start state (buttons stayed invisible on phones)
      .fromTo(
        ".hero-cta-group .btn",
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.18,
          duration: 0.65,
          clearProps: "transform,opacity"
        },
        "-=0.4"
      )
      .from(
        ".hero-image-card",
        {
          scale: 0.96,
          y: 30,
          opacity: 0,
          duration: 1.1,
          ease: "power2.out"
        },
        "-=0.9"
      );

    // 6.2 ScrollTrigger: Section Titles & Eyebrows
    const sectionHeaders = document.querySelectorAll(".section-header");
    sectionHeaders.forEach((header) => {
      gsap.from(header, {
        scrollTrigger: {
          trigger: header,
          start: "top 85%",
          toggleActions: "play none none none"
        },
        y: 35,
        opacity: 0,
        duration: 0.85,
        ease: "power2.out"
      });
    });

    // 6.3 ScrollTrigger: Section 4 — Why Candidate Selection Matters Cards
    const whyCards = document.querySelectorAll(".why-cards .feature-card");
    if (whyCards.length > 0) {
      gsap.fromTo(whyCards, { y: 45, opacity: 0 }, {
        scrollTrigger: {
          trigger: ".why-cards",
          start: "top 80%",
          toggleActions: "play none none none"
        },
        y: 0,
        opacity: 1,
        duration: 0.85,
        stagger: 0.2,
        ease: "power2.out",
        clearProps: "transform,opacity"
      });
    }

    // 6.4 ScrollTrigger: Section 5 — "What Makes a Candidate Stand Out?" flowchart
    const flowNodes = document.querySelectorAll(".fc-flow .fc-node");
    if (flowNodes.length > 0) {
      // fromTo + explicit end values: .fc-node has a CSS transform transition, which made a
      // plain .from() freeze nodes 36px low so the connector arrows looked misplaced
      gsap.fromTo(flowNodes, { y: 36, opacity: 0 }, {
        scrollTrigger: {
          trigger: ".fc-flow",
          start: "top 80%",
          toggleActions: "play none none none"
        },
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.07,
        ease: "power2.out",
        clearProps: "transform,opacity"
      });
    }

    // 6.5 ScrollTrigger: Section 6 — What You'll Learn Grid
    const learnCards = document.querySelectorAll(".learn-grid .learn-card");
    if (learnCards.length > 0) {
      gsap.fromTo(learnCards, { y: 40, opacity: 0 }, {
        scrollTrigger: {
          trigger: ".learn-grid",
          start: "top 82%",
          toggleActions: "play none none none"
        },
        y: 0,
        opacity: 1,
        duration: 0.75,
        stagger: 0.12,
        ease: "power2.out",
        clearProps: "transform,opacity"
      });
    }

    // 6.6 ScrollTrigger: Section 7 — 5-Stage Roadmap Progression
    const milestones = document.querySelectorAll(".roadmap-milestone");
    const desktopProgress = document.getElementById("roadmapProgress");

    if (milestones.length > 0) {
      gsap.from(milestones, {
        scrollTrigger: {
          trigger: ".roadmap-timeline",
          start: "top 78%",
          toggleActions: "play none none none",
          onEnter: () => {
            // Animate progress line
            if (desktopProgress) {
              if (window.innerWidth >= 992) {
                desktopProgress.style.width = "84%";
              } else {
                desktopProgress.style.height = "88%";
              }
            }
          }
        },
        y: 35,
        opacity: 0,
        duration: 0.75,
        stagger: 0.16,
        ease: "power2.out"
      });
    }

    // 6.7 ScrollTrigger: Section 8 — Event Launch Offer Card
    const detailsCard = document.querySelector(".pricing-offer-card, .event-details-card");
    if (detailsCard) {
      gsap.from(detailsCard, {
        scrollTrigger: {
          trigger: detailsCard,
          start: "top 82%",
          toggleActions: "play none none none"
        },
        y: 45,
        opacity: 0,
        duration: 0.9,
        ease: "power2.out"
      });
    }

    // 6.8 ScrollTrigger: Section 9 — Speaker Profile Card
    const speakerCard = document.querySelector(".speaker-profile-card");
    if (speakerCard) {
      gsap.from(speakerCard, {
        scrollTrigger: {
          trigger: speakerCard,
          start: "top 82%",
          toggleActions: "play none none none"
        },
        y: 40,
        opacity: 0,
        duration: 0.85,
        ease: "power2.out"
      });
    }

    // 6.9 ScrollTrigger: Section 10 — Testimonials
    const testimonials = document.querySelectorAll(".testimonial-grid .testimonial-card");
    if (testimonials.length > 0) {
      gsap.fromTo(testimonials, { y: 40, opacity: 0 }, {
        scrollTrigger: {
          trigger: ".testimonial-grid",
          start: "top 82%",
          toggleActions: "play none none none"
        },
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.18,
        ease: "power2.out",
        clearProps: "transform,opacity"
      });
    }

    // 6.10 ScrollTrigger: Section 12 — Final Conversion Banner
    const conversionPanel = document.querySelector(".conversion-panel");
    if (conversionPanel) {
      gsap.from(conversionPanel, {
        scrollTrigger: {
          trigger: conversionPanel,
          start: "top 85%",
          toggleActions: "play none none none"
        },
        y: 45,
        opacity: 0,
        scale: 0.98,
        duration: 0.9,
        ease: "power2.out"
      });
    }
  } catch (err) {
    console.warn("GSAP initialization warning:", err);
  }
});