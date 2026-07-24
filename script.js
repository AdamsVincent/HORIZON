document.getElementById("year").textContent = new Date().getFullYear();

const revealItems = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealItems.forEach((item) => observer.observe(item));

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// Ambiance sonore HORIZON
(() => {
  const audio = document.getElementById("horizonAudio");
  const button = document.getElementById("soundToggle");
  const welcome = document.getElementById("horizonWelcome");
  const welcomeOn = document.getElementById("welcomeSoundOn");
  const welcomeOff = document.getElementById("welcomeSoundOff");

  if (!audio || !button || !welcome || !welcomeOn || !welcomeOff) return;

  const icon = button.querySelector(".sound-icon");
  const label = button.querySelector(".sound-label");
  const STORAGE_KEY = "horizon-sound-enabled";
  const TARGET_VOLUME = 0.20;

  let fadeTimer = null;
  let isPlaying = false;
  let welcomeClosed = false;

  audio.volume = 0;

  function setButtonState(playing) {
    isPlaying = playing;
    button.classList.toggle("is-playing", playing);
    button.setAttribute("aria-pressed", String(playing));
    document.body.classList.toggle("sound-is-playing", playing);
    icon.textContent = playing ? "🔊" : "🎵";
    label.textContent = playing
      ? "Ambiance HORIZON activée"
      : "Entrer dans l’ambiance HORIZON";
  }

  function closeWelcome() {
    if (welcomeClosed) return;
    welcomeClosed = true;
    welcome.classList.add("is-closing");

    window.setTimeout(() => {
      welcome.classList.remove("is-visible", "is-closing");
      welcome.setAttribute("aria-hidden", "true");
      welcome.style.display = "none";
    }, 360);
  }

  function fadeTo(target, duration, onComplete) {
    if (fadeTimer) window.clearInterval(fadeTimer);

    const start = audio.volume;
    const distance = target - start;
    const startedAt = performance.now();

    fadeTimer = window.setInterval(() => {
      const progress = Math.min((performance.now() - startedAt) / duration, 1);
      audio.volume = Math.max(0, Math.min(1, start + distance * progress));

      if (progress >= 1) {
        window.clearInterval(fadeTimer);
        fadeTimer = null;
        if (onComplete) onComplete();
      }
    }, 40);
  }

  async function startAmbience() {
    try {
      audio.volume = 0;
      await audio.play();
      localStorage.setItem(STORAGE_KEY, "true");
      setButtonState(true);
      fadeTo(TARGET_VOLUME, 2000);
    } catch (error) {
      localStorage.setItem(STORAGE_KEY, "false");
      setButtonState(false);
      console.warn("La lecture audio a été bloquée par le navigateur.", error);
    }
  }

  function stopAmbience() {
    localStorage.setItem(STORAGE_KEY, "false");
    fadeTo(0, 2000, () => {
      audio.pause();
      setButtonState(false);
    });
  }

  welcomeOn.addEventListener("click", () => {
    closeWelcome();      // fermeture immédiate et indépendante de l'audio
    void startAmbience();
  });

  welcomeOff.addEventListener("click", () => {
    localStorage.setItem(STORAGE_KEY, "false");
    setButtonState(false);
    closeWelcome();
  });

  button.addEventListener("click", () => {
    if (isPlaying) {
      stopAmbience();
    } else {
      void startAmbience();
    }
  });

  audio.addEventListener("pause", () => {
    if (audio.volume === 0) setButtonState(false);
  });

  audio.addEventListener("error", () => {
    localStorage.setItem(STORAGE_KEY, "false");
    setButtonState(false);
  });

  setButtonState(false);
})();
