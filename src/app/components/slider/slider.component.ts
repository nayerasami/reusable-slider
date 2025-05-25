import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ContentChild, ElementRef, HostListener, Input, OnInit, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { ResponsiveConfig, SliderOptions } from './interfaces/sliderTypes';

@Component({
  selector: 'app-slider',
  imports: [CommonModule],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.css'
})
export class SliderComponent implements OnInit {
  constructor(private cdr: ChangeDetectorRef) { }
  @ContentChild('itemTemplate') itemTemplate!: TemplateRef<any>;
  @ViewChild('sliderWrapper', { static: true }) sliderMain!: ElementRef;
  @Input() responsiveOptions: ResponsiveConfig[] = [
    {
      breakpoint: '575px',
      numVisible: 1,
      numScroll: 1
    },
    {
      breakpoint: '767px',
      numVisible: 2,
      numScroll: 1
    },
    {
      breakpoint: '1199px',
      numVisible: 4,
      numScroll: 1
    },
    {
      breakpoint: '1400px',
      numVisible: 4,
      numScroll: 1
    }
  ];

  @Input() sliderOptions: SliderOptions = {
    navButtons: true,
    autoplay: true,
    autoplaySpeed: 3000,
    indicators: true,
    infiniteScroll: true,
    isDraggable: true,
    numberOfVisibleItems: 4,
    stepSize: 1,
  }

  @Input() sliderItems: any[] = [];
  isDragging: boolean = false;
  startX = 0;
  scrollStart = 0;
  visibleItems: any[] = [];
  currentIndex = 0;
  autoplayInterval: any;
  resizeTimeout: any;
  stepSize: number = 0;
  indicatorsLength: number = 0;
  indicatorsArray: any[] = [];
  sortedResponsiveOptons: any;
  largestBreakpoint: any;


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sliderItems'] || changes['sliderOptions']) {
      this.calculateVisibleItems();
      this.stepSize = this.sliderOptions.stepSize || 1;
      this.indicatorsLength = Math.ceil(this.sliderItems.length / this.sliderOptions.numberOfVisibleItems);
      this.indicatorsArray = Array.from({ length: this.indicatorsLength }, (_, i) => i);
      if (this.sliderOptions.autoplay) {
        this.startAutoplay();
      }
    }
    if (changes['responsiveOptions']) {
      this.applyResponsiveOptions();
      this.calculateVisibleItems();
      this.sortedResponsiveOptons = this.responsiveOptions.sort((a: any, b: any) => parseInt(a.breakpoint.replace('px', ''), 10) - parseInt(b.breakpoint.replace('px', ''), 10));
      this.largestBreakpoint = this.sortedResponsiveOptons.pop();
    }
  }

  ngOnInit(): void {
    window.addEventListener('resize', this.onWindowResize.bind(this));
    // this.applyResponsiveOptions()
    if (this.sliderOptions.autoplay) {
      this.startAutoplay();
    }

    if (this.responsiveOptions.length) {
      this.sortedResponsiveOptons = this.responsiveOptions.sort((a: any, b: any) => parseInt(a.breakpoint.replace('px', ''), 10) - parseInt(b.breakpoint.replace('px', ''), 10));
      this.largestBreakpoint = this.sortedResponsiveOptons.pop();
      this.applyResponsiveOptions();
      this.calculateVisibleItems()

    }

  }

  onWindowResize = () => {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.applyResponsiveOptions();
      this.calculateVisibleItems();
      this.cdr.detectChanges();
    }, 0);
  }

  trackItemFun(item :any ,index:any){
    return index
  }
  calculateVisibleItems() {
   this.visibleItems = this.sliderItems.slice(this.currentIndex, this.currentIndex + (this.sliderOptions.numberOfVisibleItems));
    if (this.sliderOptions.infiniteScroll) {
      this.visibleItems = [...this.visibleItems, ...this.sliderItems.slice(0, this.sliderOptions.numberOfVisibleItems)];
    }
  }

  nextFunc() {
    const step = this.stepSize;
    if (this.sliderOptions.infiniteScroll) {
      this.currentIndex += step;
      if (this.currentIndex >= this.sliderItems.length) {
        this.currentIndex = 0;
      }
      this.calculateVisibleItems();
    } else {
      if (this.currentIndex + this.sliderOptions.numberOfVisibleItems < this.sliderItems.length) {
        this.currentIndex += step;
        this.calculateVisibleItems();
      }
    }

  }

  prevFunc() {
    const step = this.stepSize;
    if (this.sliderOptions.infiniteScroll) {
      this.currentIndex -= step;
      if (this.currentIndex < 0) {
        const totalItems = this.sliderItems.length;
        this.currentIndex = totalItems - (totalItems % step || step);
      }
      this.calculateVisibleItems();
    } else {
      if (this.currentIndex - step >= 0) {
        this.currentIndex -= step;
        this.calculateVisibleItems();
      }
    }

  }

  // slide using indicators
  goToSlide(index: number): void {
    this.currentIndex = index * this.sliderOptions.numberOfVisibleItems;
    this.calculateVisibleItems();
    // const indicatorEl = e.target as HTMLElement
    // indicatorEl.classList.add('.active')
  }

  applyResponsiveOptions(): void {
    const width = window.innerWidth;
    for (let config of this.sortedResponsiveOptons) {
      const breakpoint = parseInt(config.breakpoint.replace('px', ''), 10);
      if (width <= breakpoint) {
        this.sliderOptions = {
          ...this.sliderOptions,
          numberOfVisibleItems: config.numVisible
        }
        this.stepSize = config.numScroll;
        this.indicatorsLength = Math.ceil(this.sliderItems.length / this.sliderOptions.numberOfVisibleItems);
        this.indicatorsArray = Array.from({ length: this.indicatorsLength }, (_, i) => i);
        break;
      } else {
        this.sliderOptions = {
          ...this.sliderOptions,
          numberOfVisibleItems: this.largestBreakpoint?.numVisible || this.sliderOptions.numberOfVisibleItems
        }
        this.stepSize = this.largestBreakpoint?.numScroll || 1;
        this.indicatorsLength = Math.ceil(this.sliderItems.length / this.sliderOptions.numberOfVisibleItems);
        this.indicatorsArray = Array.from({ length: this.indicatorsLength }, (_, i) => i);
      }
    }
    this.cdr.detectChanges();
  }

  //handle scroll by dragging
  @HostListener('document:mouseup', ['$event'])
  onmouseup(event: MouseEvent) {
    this.isDragging = false;
  }

  //handle autoplay
  startAutoplay(): void {
    if (this.sliderOptions.autoplay) {
      this.autoplayInterval = setInterval(() => {
        this.nextFunc();
      }, this.sliderOptions.autoplaySpeed || 3000); //default 3s
    }
  }

  stopAutoplay(): void {
    if (this.autoplayInterval && this.sliderOptions.autoplay) {
      clearInterval(this.autoplayInterval);
    }
  }


  onDestroy() {
    this.stopAutoplay();
    window.removeEventListener('resize', this.onWindowResize);
  }

}
