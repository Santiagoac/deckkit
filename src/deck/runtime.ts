/** Deck runtime: navigation, modes and URL state. No dependencies. */

type Mode = 'normal' | 'present' | 'overview';

class Deck {
  private deck: HTMLElement;
  private slides: HTMLElement[];
  private index = 0;
  private mode: Mode = 'normal';
  private counter: HTMLElement | null;
  private bar: HTMLElement | null;
  private notes: HTMLElement | null;
  private showNotes: boolean;

  constructor(deck: HTMLElement) {
    this.deck = deck;
    this.slides = Array.from(deck.querySelectorAll<HTMLElement>('.slide'));
    this.counter = document.querySelector('.controls__counter');
    this.bar = document.querySelector('.progress__bar');
    this.notes = document.querySelector('.notes');

    const params = new URLSearchParams(location.search);
    this.showNotes = params.has('notes');
    this.index = this.readHash();
    if (params.has('present')) this.setMode('present');

    this.bindKeyboard();
    this.bindTouch();
    this.bindButtons();
    this.bindScroll();
    this.bindOverview();
    this.bindHash();
    this.autoHideControls();
    this.topBar();
    this.fitAll();
    this.refitOnChange();

    if (this.mode === 'present') this.ir(this.index);
    else if (this.index > 0) this.slides[this.index]?.scrollIntoView();
    this.render();
  }

  private readHash(): number {
    const n = parseInt(location.hash.replace('#', ''), 10);
    return Number.isFinite(n) ? this.clamp(n - 1) : 0;
  }

  private clamp(i: number): number {
    return Math.max(0, Math.min(this.slides.length - 1, i));
  }

  ir(i: number) {
    this.index = this.clamp(i);
    if (this.mode === 'normal') {
      this.slides[this.index]?.scrollIntoView({ behavior: 'smooth' });
    }
    this.render();
  }

  next() { this.ir(this.index + 1); }
  prev() { this.ir(this.index - 1); }

  setMode(m: Mode) {
    this.mode = m;
    this.deck.dataset.mode = m;
    if (m === 'normal') this.slides[this.index]?.scrollIntoView();
    this.render();
  }

  toggleMode(m: Mode) {
    this.setMode(this.mode === m ? 'normal' : m);
  }

  private render() {
    this.slides.forEach((s, i) => {
      if (i === this.index) s.setAttribute('data-active', '');
      else s.removeAttribute('data-active');
    });

    const total = this.slides.length;
    if (this.counter) this.counter.textContent = `${this.index + 1} / ${total}`;
    if (this.bar) this.bar.style.width = `${((this.index + 1) / total) * 100}%`;
    if (this.notes && this.showNotes) {
      this.notes.textContent = this.slides[this.index]?.dataset.notes ?? '';
    }

    const hash = `#${this.index + 1}`;
    if (location.hash !== hash) history.replaceState(null, '', hash + location.search);
  }

  private bindKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const inField = (e.target as HTMLElement)?.closest('input, textarea, [contenteditable]');
      if (inField) return;

      switch (e.key) {
        case 'ArrowRight': case 'PageDown': case ' ':
          e.preventDefault(); this.next(); break;
        case 'ArrowLeft': case 'PageUp':
          e.preventDefault(); this.prev(); break;
        case 'Home': e.preventDefault(); this.ir(0); break;
        case 'End': e.preventDefault(); this.ir(this.slides.length - 1); break;
        case 'p': case 'P': this.toggleMode('present'); break;
        case 'o': case 'O': this.toggleMode('overview'); break;
        case 'Escape': if (this.mode !== 'normal') this.setMode('normal'); break;
      }
    });
  }

  private bindTouch() {
    let x0 = 0, y0 = 0;
    this.deck.addEventListener('touchstart', (e) => {
      x0 = e.changedTouches[0].clientX; y0 = e.changedTouches[0].clientY;
    }, { passive: true });

    this.deck.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - x0;
      const dy = e.changedTouches[0].clientY - y0;
      // Only counts as a swipe if the gesture is clearly horizontal
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      // A swipe inside a horizontal carousel belongs to the carousel, not the deck
      if ((e.target as HTMLElement)?.closest?.('[data-scroll-h]')) return;
      dx < 0 ? this.next() : this.prev();
    }, { passive: true });
  }

  private bindButtons() {
    document.querySelector('[data-action="prev"]')?.addEventListener('click', () => this.prev());
    document.querySelector('[data-action="next"]')?.addEventListener('click', () => this.next());
    document.querySelector('[data-action="overview"]')?.addEventListener('click', () => this.toggleMode('overview'));
    document.querySelector('[data-action="present"]')?.addEventListener('click', () => this.toggleMode('present'));
  }

  /** In normal mode the active slide is driven by scroll, not the keyboard. */
  private bindScroll() {
    const io = new IntersectionObserver((entries) => {
      if (this.mode !== 'normal') return;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const i = this.slides.indexOf(entry.target as HTMLElement);
        if (i >= 0 && i !== this.index) { this.index = i; this.render(); }
      }
    }, { threshold: 0.55 });
    this.slides.forEach((s) => io.observe(s));
  }

  /** In a meeting the controls get in the way. They fade on their own and return on mouse move. */
  private autoHideControls() {
    const controls = document.querySelector<HTMLElement>('.controls');
    if (!controls) return;
    let timer: number;
    const wake = () => {
      controls.removeAttribute('data-idle');
      clearTimeout(timer);
      timer = window.setTimeout(() => controls.setAttribute('data-idle', ''), 2500);
    };
    ['pointermove', 'pointerdown', 'keydown', 'touchstart'].forEach((ev) =>
      document.addEventListener(ev, wake, { passive: true }),
    );
    wake();
  }

  /** A slide always fits the screen. If the content does not, a global factor is
   *  lowered until it does. The factor scales the tokens (type and spacing), not
   *  the box, so text reflows and keeps using the full width. */
  private fit(slide: HTMLElement) {
    const MIN = 0.5;
    const fits = (f: number) => {
      slide.style.setProperty('--fit', String(f));
      return slide.scrollHeight <= slide.clientHeight + 1;
    };

    if (fits(1)) { slide.style.removeProperty('--fit'); return; }

    let lo = MIN, hi = 1;
    for (let i = 0; i < 7; i++) {
      const mid = (lo + hi) / 2;
      if (fits(mid)) lo = mid; else hi = mid;
    }
    slide.style.setProperty('--fit', lo.toFixed(3));
    // If even the minimum does not fit, the slide carries too much content:
    // better to let it scroll than to make it illegible.
    slide.dataset.overflows = fits(lo) ? '' : 'si';
    if (slide.dataset.overflows === 'si') slide.style.setProperty('--fit', String(MIN));
  }

  fitAll() {
    this.slides.forEach((s) => this.fit(s));
  }

  private refitOnChange() {
    let timer: number;
    const refit = () => {
      clearTimeout(timer);
      timer = window.setTimeout(() => this.fitAll(), 120);
    };
    window.addEventListener('resize', refit, { passive: true });
    window.addEventListener('orientationchange', refit);
    // Images change the height when they load: measure again
    this.deck.querySelectorAll('img').forEach((img) => {
      if (!img.complete) img.addEventListener('load', refit, { once: true });
    });
    document.fonts?.ready.then(refit);
  }

  /** A link to another slide (#7) must work even when the page is already open. */
  /** The top bar only appears when the cursor reaches the top edge.
   *  During a presentation no chrome should be in sight. */
  private topBar() {
    const bar = document.querySelector<HTMLElement>('.topbar');
    if (!bar) return;
    const THRESHOLD = 64;

    document.addEventListener('pointermove', (e) => {
      if (e.clientY <= THRESHOLD) bar.setAttribute('data-visible', '');
      else if (!bar.matches(':hover, :focus-within')) bar.removeAttribute('data-visible');
    }, { passive: true });

    // With a keyboard there is no cursor: tabbing to the link shows the bar
    bar.addEventListener('focusin', () => bar.setAttribute('data-visible', ''));
    bar.addEventListener('focusout', () => bar.removeAttribute('data-visible'));

    // On touch there is no hover: a tap on the top strip reveals it
    document.addEventListener('touchstart', (e) => {
      const y = e.touches[0]?.clientY ?? 999;
      if (y <= THRESHOLD) bar.setAttribute('data-visible', '');
      else bar.removeAttribute('data-visible');
    }, { passive: true });
  }

  private bindHash() {
    window.addEventListener('hashchange', () => {
      const target = this.readHash();
      if (target !== this.index) this.ir(target);
    });
  }

  private bindOverview() {
    this.slides.forEach((s, i) => {
      s.addEventListener('click', () => {
        if (this.mode !== 'overview') return;
        this.index = i;
        this.setMode('normal');
      });
    });
  }
}

const root = document.querySelector<HTMLElement>('.deck');
if (root) new Deck(root);
