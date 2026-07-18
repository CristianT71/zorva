import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
} from '@angular/core';

export type RobotState = 'idle' | 'thinking' | 'error' | 'success';

const IDLE_GESTURES = ['gesture-look', 'gesture-wink', 'gesture-bounce', 'gesture-shake', 'gesture-antenna'];
const SPARK_COLORS = ['#4fd8ff', '#9b6bff', '#ffb84f'];

@Component({
  selector: 'app-robot-mascot',
  standalone: true,
  templateUrl: './robot-mascot.component.html',
  styleUrls: ['./robot-mascot.component.scss'],
})
export class RobotMascotComponent implements OnInit, OnDestroy {
  @Input() tooltip = 'Tócame';

  @Input() set state(value: RobotState) {
    this._state = value;
    this.applyStateClass();
  }
  get state(): RobotState {
    return this._state;
  }
  private _state: RobotState = 'idle';

  @Output() robotClicked = new EventEmitter<void>();

  private idleGestureTimer?: ReturnType<typeof setTimeout>;
  private wrapEl!: HTMLElement;

  constructor(private el: ElementRef<HTMLElement>, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.wrapEl = this.el.nativeElement.querySelector('.robot-wrap') as HTMLElement;
    this.applyStateClass();
    this.scheduleNextIdleGesture();
    this.renderer.listen(this.wrapEl, 'click', () => this.onClick());
  }

  ngOnDestroy(): void {
    clearTimeout(this.idleGestureTimer);
  }

  /** Aplica la clase de estado principal (idle/thinking/error/success) al wrapper. */
  private applyStateClass(): void {
    if (!this.wrapEl) return;
    this.wrapEl.className = 'robot-wrap ' + this._state;
  }

  /** Gestos aleatorios en reposo, para que se sienta "vivo" sin que pase nada. */
  private playRandomIdleGesture(): void {
    if (this._state !== 'idle') return;

    const gesture = IDLE_GESTURES[Math.floor(Math.random() * IDLE_GESTURES.length)];
    this.renderer.addClass(this.wrapEl, gesture);

    setTimeout(() => this.renderer.removeClass(this.wrapEl, gesture), 1700);
  }

  private scheduleNextIdleGesture(): void {
    clearTimeout(this.idleGestureTimer);
    // entre 3.5s y 8s, para que no sea predecible
    const delay = 3500 + Math.random() * 4500;
    this.idleGestureTimer = setTimeout(() => {
      this.playRandomIdleGesture();
      this.scheduleNextIdleGesture();
    }, delay);
  }

  private onClick(): void {
    if (this._state !== 'idle') return;
    this.renderer.addClass(this.wrapEl, 'gesture-poke');
    setTimeout(() => this.renderer.removeClass(this.wrapEl, 'gesture-poke'), 500);
    this.triggerClickFx();
    this.robotClicked.emit();
  }

  /** Chispas + onda + estrella flotante al tocar al robot. */
  private triggerClickFx(): void {
    const fx = this.renderer.createElement('div');
    this.renderer.addClass(fx, 'robot-fx');
    this.renderer.appendChild(this.wrapEl, fx);

    const ripple = this.renderer.createElement('div');
    this.renderer.addClass(ripple, 'fx-ripple');
    this.renderer.appendChild(fx, ripple);

    const sparkCount = 8;
    for (let i = 0; i < sparkCount; i++) {
      const spark = this.renderer.createElement('div');
      this.renderer.addClass(spark, 'fx-spark');
      const angle = (Math.PI * 2 * i) / sparkCount + (Math.random() * 0.3 - 0.15);
      const distance = 24 + Math.random() * 16;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;
      const color = SPARK_COLORS[i % SPARK_COLORS.length];
      this.renderer.setStyle(spark, '--dx', dx.toFixed(1) + 'px');
      this.renderer.setStyle(spark, '--dy', dy.toFixed(1) + 'px');
      this.renderer.setStyle(spark, 'background', color);
      this.renderer.setStyle(spark, 'box-shadow', '0 0 6px ' + color);
      this.renderer.setStyle(spark, 'animation-delay', Math.random() * 0.05 + 's');
      this.renderer.appendChild(fx, spark);
    }

    const star = this.renderer.createElement('div');
    this.renderer.addClass(star, 'fx-star');
    star.innerHTML =
      '<svg viewBox="0 0 24 24"><path d="M12 2 L14.7 9.1 L22.2 9.8 L16.4 14.7 L18.3 22 L12 17.9 L5.7 22 L7.6 14.7 L1.8 9.8 L9.3 9.1 Z" fill="var(--accent-amber)" stroke="rgba(255,255,255,0.4)" stroke-width="0.6" stroke-linejoin="round"/></svg>';
    this.renderer.appendChild(fx, star);

    setTimeout(() => fx.remove(), 950);
  }
}
