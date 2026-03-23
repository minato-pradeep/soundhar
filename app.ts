import { Component, OnDestroy, HostListener, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements AfterViewInit, OnDestroy {

  /* ─── Navbar ─── */
  isScrolled    = false;
  menuOpen      = false;
  activeSection = 'hero';

  /* ─── Cursor ─── */
  private cursorEl: HTMLElement | null = null;
  private trailEl:  HTMLElement | null = null;
  private mx = 0; private my = 0;
  private tx = 0; private ty = 0;
  private rafId = 0;

  /* ─── Observers ─── */
  private revealObs!: IntersectionObserver;
  private langObs!:   IntersectionObserver;
  private skillObs!:  IntersectionObserver;

  /* ─── Lifecycle ─── */
  ngAfterViewInit(): void {
    this.initCursor();
    this.initReveal();
    this.initLangBars();
    this.initSkillStagger();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
    this.revealObs?.disconnect();
    this.langObs?.disconnect();
    this.skillObs?.disconnect();
  }

  /* ─── Scroll ─── */
  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled = window.scrollY > 80;
    document.querySelectorAll('section[id]').forEach(s => {
      if (window.scrollY >= (s as HTMLElement).offsetTop - 220)
        this.activeSection = s.id;
    });
  }

  /* ─── Menu ─── */
  toggleMenu(): void { this.menuOpen = !this.menuOpen; }
  closeMenu():  void { this.menuOpen = false; }

  /* ─── Custom Cursor ─── */
  private initCursor(): void {
    this.cursorEl = document.getElementById('ss_cur');
    this.trailEl  = document.getElementById('ss_trail');

    document.addEventListener('mousemove', (e: MouseEvent) => {
      this.mx = e.clientX;
      this.my = e.clientY;
      if (this.cursorEl) {
        this.cursorEl.style.left = (e.clientX - 5) + 'px';
        this.cursorEl.style.top  = (e.clientY - 5) + 'px';
      }
    });

    const loop = () => {
      this.tx += (this.mx - this.tx) * 0.13;
      this.ty += (this.my - this.ty) * 0.13;
      if (this.trailEl) {
        this.trailEl.style.left = (this.tx - 19) + 'px';
        this.trailEl.style.top  = (this.ty - 19) + 'px';
      }
      this.rafId = requestAnimationFrame(loop);
    };
    loop();

    document.querySelectorAll('a, button, .pill, .acc-card, .edu-card, .tl-card, .hstat')
      .forEach(el => {
        el.addEventListener('mouseenter', () => {
          if (this.cursorEl) this.cursorEl.style.transform = 'scale(2.8)';
          if (this.trailEl)  this.trailEl.style.transform  = 'scale(1.5)';
        });
        el.addEventListener('mouseleave', () => {
          if (this.cursorEl) this.cursorEl.style.transform = 'scale(1)';
          if (this.trailEl)  this.trailEl.style.transform  = 'scale(1)';
        });
      });
  }

  /* ─── Scroll Reveal ─── */
  private initReveal(): void {
    this.revealObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          this.revealObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.rv').forEach(el => this.revealObs.observe(el));
  }

  /* ─── Language Bars ─── */
  private initLangBars(): void {
    const section = document.getElementById('ss_lang');
    if (!section) return;

    this.langObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          section.querySelectorAll<HTMLElement>('.lfill').forEach(bar => {
            bar.style.width = (bar.dataset['pct'] ?? '0') + '%';
          });
          this.langObs.disconnect();
        }
      });
    }, { threshold: 0.4 });

    this.langObs.observe(section);
  }

  /* ─── Skill Pill Stagger ─── */
  private initSkillStagger(): void {
    const wrap = document.querySelector('.skills-wrap');
    if (!wrap) return;

    this.skillObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          wrap.querySelectorAll('.pill').forEach((p, i) => {
            setTimeout(() => p.classList.add('pill-show'), i * 42);
          });
          this.skillObs.disconnect();
        }
      });
    }, { threshold: 0.1 });

    this.skillObs.observe(wrap);
  }
}
