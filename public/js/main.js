(() => {
  const currentPage = document.body.dataset.page;
  document.querySelectorAll('.nav a').forEach((link) => {
    const href = link.getAttribute('href') || '';
    const isHome = currentPage === 'home' && href.includes('index');
    if (isHome || (currentPage && href.includes(currentPage))) {
      link.classList.add('active');
    }
  });

  const nav = document.querySelector('.nav');
  const menuToggle = document.querySelector('.menu-toggle');
  const sidebarToggle = document.querySelector('[data-sidebar-toggle]');
  const sidebarOpen = document.querySelector('[data-sidebar-open]');
  const bodyEl = document.body;

  if (nav && menuToggle) {
    menuToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      menuToggle.classList.toggle('is-open', isOpen);
      bodyEl.classList.toggle('nav-open', isOpen);
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (nav.classList.contains('is-open')) {
          nav.classList.remove('is-open');
          menuToggle.setAttribute('aria-expanded', 'false');
          menuToggle.classList.remove('is-open');
          bodyEl.classList.remove('nav-open');
        }
      });
    });
  }

  const setSidebarCollapsed = (collapsed) => {
    if (collapsed) {
      bodyEl.classList.add('nav-collapsed');
      nav?.classList.remove('is-open');
      menuToggle?.classList.remove('is-open');
      menuToggle?.setAttribute('aria-expanded', 'false');
    } else {
      bodyEl.classList.remove('nav-collapsed');
    }
    sidebarToggle?.setAttribute('aria-pressed', collapsed ? 'true' : 'false');
  };

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      const collapsed = !bodyEl.classList.contains('nav-collapsed');
      setSidebarCollapsed(collapsed);
    });
  }

  if (sidebarOpen) {
    sidebarOpen.addEventListener('click', () => setSidebarCollapsed(false));
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const el = document.querySelector(targetId);
      if (el) {
        event.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  const readToggle = document.querySelector('[data-read-toggle]');
  if (readToggle && 'speechSynthesis' in window) {
    let utterance;
    const statusText = (text) => {
      readToggle.textContent = text;
    };

    const stopSpeech = () => {
      window.speechSynthesis.cancel();
      statusText('Read Aloud');
      readToggle.setAttribute('aria-pressed', 'false');
    };

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopSpeech();
      }
    });

    window.addEventListener('pagehide', stopSpeech);

    readToggle.addEventListener('click', () => {
      const isSpeaking = window.speechSynthesis.speaking;
      if (isSpeaking) {
        stopSpeech();
        return;
      }
      const main = document.querySelector('main');
      if (!main) return;
      const text = main.innerText.trim();
      if (!text) return;
      utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.onend = stopSpeech;
      utterance.onerror = stopSpeech;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      statusText('Stop Read Aloud');
      readToggle.setAttribute('aria-pressed', 'true');
    });
  } else if (readToggle) {
    readToggle.disabled = true;
    readToggle.textContent = 'Read Aloud (not supported)';
  }



  const walkthroughs = {
    grounding: {
      title: '5-4-3-2-1 grounding',
      steps: [
        'Pause where you are. Plant your feet and let your shoulders drop.',
        'Notice five things you can see. Say them quietly or in your head.',
        'Notice four things you can feel against your skin or clothes.',
        'Notice three things you can hear, even if they are faint.',
        'Notice two things you can smell, or remember a calming scent.',
        'Notice one thing you can taste. Take a slow breath to finish.',
      ],
    },
    breathing: {
      title: 'Breathing reset',
      steps: [
        'Sit or stand comfortably. Let your stomach soften so air can move.',
        'Breathe in through your nose for a count of four.',
        'Hold the breath gently for a count of two.',
        'Exhale through your mouth for a count of six, like fogging a mirror.',
        'Repeat the 4-2-6 pattern three to five times. Go slower if you feel dizzy.',
      ],
    },
    microbreak: {
      title: 'Micro-break loop',
      steps: [
        'Stand up and roll your shoulders back three times.',
        'Walk to get water or stretch your arms over your head.',
        'Look 20 feet away for 20 seconds to rest your eyes.',
        'Sit back down, plant feet, and take one steady breath before restarting.',
      ],
    },
    executive: {
      title: 'Three-step task start',
      steps: [
        'Name the smallest first action, like opening a doc or taking out paper.',
        'Set a 5- or 10-minute timer. Promise yourself you can stop when it ends.',
        'Start the tiny action. When the timer ends, decide: pause, continue, or ask for help.',
      ],
    },
    sensory: {
      title: 'Sensory calm space',
      steps: [
        'Find the nearest calmer spot: a hallway, corner, or spot by a window.',
        'Lower input: dim lights if possible, or turn your screen brightness down.',
        'Use sound support: headphones, earplugs, or a soft song at low volume.',
        'Add comfort: a soft texture, deep breaths, or gentle pressure on your hands.',
        'Stay for two to three minutes, then re-enter slowly.',
      ],
    },
    social: {
      title: 'Respectful pause script',
      steps: [
        'Notice rising stress. Place a hand on your chest or desk to signal pause to yourself.',
        'Use a short line: "I need two minutes to breathe, then I will come back."',
        'Step away, take three slow breaths, and shake out your hands or arms.',
        'Return and name the next step: "Thanks for waiting. Let us pick up at..."',
      ],
    },
  };

  const overlay = document.querySelector('[data-walkthrough-overlay]');
  const stepEl = overlay?.querySelector('[data-walkthrough-step]');
  const titleEl = overlay?.querySelector('#walkthrough-title');
  const progressEl = overlay?.querySelector('[data-walkthrough-progress]');
  const nextBtn = overlay?.querySelector('[data-walkthrough-next]');
  const prevBtn = overlay?.querySelector('[data-walkthrough-prev]');
  const closeBtn = overlay?.querySelector('[data-walkthrough-close]');
  let activeId = null;
  let stepIndex = 0;

  const renderWalkthrough = () => {
    if (!overlay || !activeId) return;
    const data = walkthroughs[activeId];
    if (!data) return;
    const total = data.steps.length;
    const current = data.steps[stepIndex] || '';
    titleEl.textContent = data.title;
    stepEl.textContent = current;
    progressEl.textContent = `Step ${stepIndex + 1} of ${total}`;
    prevBtn.disabled = stepIndex === 0;
    nextBtn.textContent = stepIndex === total - 1 ? 'Finish' : 'Next';
  };

  const closeWalkthrough = () => {
    if (!overlay) return;
    overlay.hidden = true;
    overlay.setAttribute('aria-hidden', 'true');
    activeId = null;
    stepIndex = 0;
  };

  const openWalkthrough = (id) => {
    if (!overlay || !walkthroughs[id]) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    activeId = id;
    stepIndex = 0;
    overlay.hidden = false;
    overlay.setAttribute('aria-hidden', 'false');
    renderWalkthrough();
  };

  document.querySelectorAll('[data-walkthrough]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const id = trigger.getAttribute('data-walkthrough');
      openWalkthrough(id);
    });
  });

  nextBtn?.addEventListener('click', () => {
    if (!activeId) return;
    const steps = walkthroughs[activeId]?.steps || [];
    if (stepIndex < steps.length - 1) {
      stepIndex += 1;
      renderWalkthrough();
    } else {
      closeWalkthrough();
    }
  });

  prevBtn?.addEventListener('click', () => {
    if (!activeId) return;
    if (stepIndex > 0) {
      stepIndex -= 1;
      renderWalkthrough();
    }
  });

  closeBtn?.addEventListener('click', closeWalkthrough);

  overlay?.addEventListener('click', (event) => {
    if (event.target === overlay) {
      closeWalkthrough();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && overlay && !overlay.hidden) {
      closeWalkthrough();
    }
  });

})();
