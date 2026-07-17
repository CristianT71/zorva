import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  input,
  viewChild,
} from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

/**
 * Thin wrapper around Chart.js so components stay declarative.
 * Re-renders whenever the `config` input changes.
 */
@Component({
  selector: 'app-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #canvas></canvas>`,
  styles: [
    `
      :host {
        display: block;
        position: relative;
        width: 100%;
        height: 100%;
      }
    `,
  ],
})
export class ChartComponent implements AfterViewInit, OnDestroy {
  config = input.required<ChartConfiguration>();
  private canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private chart?: Chart;
  private viewReady = false;

  constructor() {
    // Rebuild the chart on config changes, but only once the canvas exists.
    effect(() => {
      const cfg = this.config();
      if (this.viewReady) this.render(cfg);
    });
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.render(this.config());
  }

  private render(config: ChartConfiguration): void {
    this.chart?.destroy();
    this.chart = new Chart(this.canvasRef().nativeElement, config);
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}
