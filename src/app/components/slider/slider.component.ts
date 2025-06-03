import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ResponsiveConfig,
  SliderOptions,
  CustomSliderItems,
} from './interfaces/sliderTypes';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import Hammer from 'hammerjs';
@Component({
  selector: 'app-slider',
  imports: [CommonModule],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.css',
})
export class SliderComponent implements OnInit {
  constructor(private cdr: ChangeDetectorRef, private sanitizer: DomSanitizer) { }
  @ContentChild('itemTemplate') itemTemplate!: TemplateRef<any>;
  @ViewChild('singleRowSlider', { static: false }) singleRowSlider!: ElementRef;
  @ViewChild('multiRowSlider', { static: false }) multiRowSlider!: ElementRef;
  @Input() responsiveOptions: any;
  @Input() sliderOptions: any;
  @Input() sliderItems: any[] = [];
  currentIndex = 0;
  autoplayInterval: any;
  resizeTimeout: any;
  stepSize: number = 0;
  indicatorsLength: number = 0;
  indicatorsArray: any[] = [];
  sortedResponsiveOptons: any;
  largestBreakpoint: any;
  translateX: number = 0;
  isRTL: boolean = false;
  animationSpeed: string = '0.6s';
  animation: string = 'linear';
  numberOfVisibleItems: number = 4;
  maxCurrentIndex: any;
  spaceBetween: number = 0;
  clonedSliderItems: any[] = [];
  safePrevButton: any;
  safeNextButton: any;
  customSliderItems: any = {};
  numberOfRows: number = 1;
  rowsArray: any[] = [];
  isTransitionEnabled = true;
  hammer?: HammerManager;
  isDragging: boolean = false;
  dragStartTranslateX: number = 0;
  dragThreshold: number = 50;
  isDraggable: boolean = true;
  isInfiniteScroll: boolean = false;
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sliderItems'] || changes['sliderOptions']) {
      this.calculateSliderPosition();
      this.clonedSliderItems = [...this.sliderItems];
      this.stepSize = this.sliderOptions.stepSize || 1;
      this.numberOfVisibleItems = this.sliderOptions.numberOfVisibleItems;
      this.numberOfRows = this.sliderOptions.rows || 1;
      this.spaceBetween = this.sliderOptions.spaceBetween ?? 12;
      this.isRTL = this.sliderOptions.rtl || false;
      this.animationSpeed = this.sliderOptions.animationSpeed ?? '0.6s';
      this.animation = this.sliderOptions.animation ?? 'linear';
      this.safeNextButton = this.sliderOptions.nextButton ? this.sanitizer.bypassSecurityTrustHtml(this.sliderOptions.nextButton) : '';
      this.safePrevButton = this.sliderOptions.prevButton ? this.sanitizer.bypassSecurityTrustHtml(this.sliderOptions.prevButton) : '';
      this.isDraggable = this.sliderOptions.isDraggable ?? true;
      this.isInfiniteScroll = this.sliderOptions.infiniteScroll ?? false;
      this.rowsArray = Array.from({ length: this.sliderOptions.rows }, (_, i) => i);
      this.calculateIndicators();
      this.handleInfiniteScrollSliderItems();

      for (let key = 0; key < this.sliderOptions.rows; key++) {
        this.customSliderItems[key] = [];
      }
      for (let i = 0; i < this.sliderItems.length; i += this.sliderOptions.rows) {
        for (let j = 0; j < this.sliderOptions.rows; j++) {
          const item = this.sliderItems[i + j];
          if (item !== undefined) {
            this.customSliderItems[j].push(item);
          }
        }
      }
      if (this.sliderOptions.autoplay) {
        this.startAutoplay();
      }

    }
    if (changes['responsiveOptions']) {
      this.sortedResponsiveOptons = this.responsiveOptions.sort((a: any, b: any) => parseInt(a.breakpoint.replace('px', ''), 10) - parseInt(b.breakpoint.replace('px', ''), 10));
      this.largestBreakpoint = this.sortedResponsiveOptons[this.sortedResponsiveOptons.length - 1];
      this.applyResponsiveOptions();
      this.calculateSliderPosition();
    }
  }

  calculateIndicators() {
    const totalSlides = (this.clonedSliderItems.length / this.numberOfRows - this.numberOfVisibleItems) / this.stepSize + 1;
    this.indicatorsLength = Math.ceil(totalSlides);
    this.indicatorsArray = Array.from({ length: this.indicatorsLength }, (_, i) => i);
    this.maxCurrentIndex = (this.sliderItems.length - 1) / this.numberOfRows - (this.numberOfVisibleItems - this.stepSize);
  }

  handleInfiniteScrollSliderItems() {
    if (!this.isInfiniteScroll) {
      this.sliderItems = [...this.clonedSliderItems];
      this.currentIndex = 0;
      this.translateX = 0;
    } else {
      this.sliderItems = [...this.clonedSliderItems];
      const startClone = this.sliderItems.slice(0,  this.numberOfVisibleItems);
      const endClone = this.sliderItems.slice(- this.numberOfVisibleItems);
      this.sliderItems = [...endClone, ...this.sliderItems, ...startClone];
      this.currentIndex =  this.numberOfVisibleItems;
      this.translateX = -(this.currentIndex * (100 / this.numberOfVisibleItems));
    }
  }
  ngOnInit(): void {
    window.addEventListener('resize', this.onWindowResize.bind(this));
    if (this.responsiveOptions.length) {
      this.sortedResponsiveOptons = this.responsiveOptions.sort((a: any, b: any) => parseInt(a.breakpoint.replace('px', ''), 10) - parseInt(b.breakpoint.replace('px', ''), 10));
      this.largestBreakpoint = this.sortedResponsiveOptons.pop();
      this.applyResponsiveOptions();
      this.calculateSliderPosition();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initializeHammer();
    }, 0);
  }

  onWindowResize = () => {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.applyResponsiveOptions();
      this.calculateSliderPosition();
      this.cdr.detectChanges();
    }, 0);
  };

  trackItemFun(item: any, index: any) {
    return index;
  }

  calculateSliderPosition() {
    const itemWidth = 100 / this.sliderOptions.numberOfVisibleItems;
    this.translateX = this.isRTL ? this.translateX = +(this.currentIndex * itemWidth) : this.translateX = -(this.currentIndex * itemWidth)
  }

  applyResponsiveOptions(): void {
    if (!this.sortedResponsiveOptons || this.sortedResponsiveOptons.length === 0) {
      return;
    }
    const width = window.innerWidth;
    let configFound = false;
    for (let config of this.sortedResponsiveOptons) {
      const breakpoint = parseInt(config.breakpoint.replace('px', ''), 10);
      if (width <= breakpoint) {
        this.sliderOptions = {
          ...this.sliderOptions,
          numberOfVisibleItems: config.numVisible,
          stepSize: config.numScroll,
        };
        this.numberOfVisibleItems = config.numVisible;
        this.stepSize = config.numScroll;
        // this.maxCurrentIndex = (this.sliderItems.length - 1) / this.numberOfRows - (config.numVisible - config.numScroll);
        this.calculateIndicators()
        configFound = true;
        break;
      }
    }
    if (!configFound && this.largestBreakpoint) {
      this.sliderOptions = {
        ...this.sliderOptions,
        numberOfVisibleItems: this.largestBreakpoint.numVisible,
      };
      this.numberOfVisibleItems = this.largestBreakpoint.numVisible;
      this.stepSize = this.largestBreakpoint.numScroll || 1;
      this.calculateIndicators()
      //this.maxCurrentIndex = (this.sliderItems.length - 1) / this.numberOfRows - (this.largestBreakpoint.numVisible - this.stepSize);
    }
    // Reset current index if it exceeds the new maximum
    if (this.currentIndex > this.maxCurrentIndex) {
      this.currentIndex = 0;
    }
    this.handleInfiniteScrollSliderItems();

    this.cdr.detectChanges();
  }
  slideFinite(forward: boolean): void {
    const dir = this.isRTL ? -1 : 1;
    const movement = forward ? 1 : -1
    const newIndex = this.currentIndex + (dir * this.stepSize * movement);
    if (newIndex >= 0 && newIndex <= this.maxCurrentIndex) {
      this.currentIndex = newIndex;
      this.calculateSliderPosition();
    }

  }
  nextFunc(): void {
    if (this.isInfiniteScroll) {
      this.slideInfinite(true);
    } else {
      this.slideFinite(true);
    }
  }

  prevFunc(): void {
    if (this.isInfiniteScroll) {
      this.slideInfinite(false);
    } else {
      this.slideFinite(false)
    }
  }

  slideInfinite(forward: boolean): void {
    this.currentIndex += forward ? this.stepSize : -this.stepSize;
    this.isTransitionEnabled = true;
    this.calculateSliderPosition();
    const timeout = parseFloat(this.animationSpeed) * 1000;
    setTimeout(() => {
      this.isTransitionEnabled = false;
      if (forward && this.currentIndex >= this.sliderItems.length -  this.numberOfVisibleItems) {
        this.currentIndex =  this.numberOfVisibleItems + (this.clonedSliderItems.length % this.stepSize == 0 ? 0 : (this.currentIndex - this.numberOfVisibleItems - this.clonedSliderItems.length));
      } else if (!forward && this.currentIndex <  this.numberOfVisibleItems) {
        this.currentIndex = this.sliderItems.length -  this.numberOfVisibleItems - this.stepSize;
      }
      this.calculateSliderPosition();
    }, timeout);
  }

  // indicators
  goToSlide(index: number): void {
    this.currentIndex = this.isInfiniteScroll ? index * this.stepSize + this.numberOfVisibleItems : Math.min(index * this.stepSize, this.maxCurrentIndex);
    this.isTransitionEnabled = true;
    this.calculateSliderPosition();
  }
  getCurrentIndicator(): number {
    const baseIndex = this.currentIndex - (this.isInfiniteScroll ? this.numberOfVisibleItems : 0);
    return Math.floor(baseIndex / this.stepSize);
  }

  // drag
  private initializeHammer() {
    let sliderElement: HTMLElement | null = null;
    if (this.sliderOptions.rows == 1) {
      if (this.singleRowSlider && this.singleRowSlider.nativeElement) {
        sliderElement = this.singleRowSlider.nativeElement;
      }
    } else if (this.sliderOptions.rows > 1) {
      if (this.multiRowSlider && this.multiRowSlider.nativeElement) {
        sliderElement = this.multiRowSlider.nativeElement;
      }
    }
    if (!sliderElement) {
      console.warn('Slider element not found');
      return;
    }
    this.hammer = new Hammer(sliderElement);
    this.hammer.get('pan').set({
      direction: Hammer.DIRECTION_HORIZONTAL,
      threshold: 10,
    });
    this.hammer.on('panstart', (ev) => {
      this.onDragStart(ev);
    });
    this.hammer.on('panmove', (ev) => {
      this.onDragMove(ev);
    });
    this.hammer.on('panend', (ev) => {
      this.onDragEnd(ev);
    });
  }

  private onDragStart(event: any): void {
    if (!this.isDraggable) return;
    this.isDragging = true;
    this.dragStartTranslateX = this.translateX;
    if (this.sliderOptions.autoplay) {
      this.stopAutoplay();
    }
    this.isTransitionEnabled = false;
  }

  private onDragMove(event: any): void {
    if (!this.isDragging || !this.isDraggable) return;
    const containerWidth =
      this.numberOfRows > 1
        ? this.multiRowSlider.nativeElement.offsetWidth
        : this.singleRowSlider.nativeElement.offsetWidth;
    const dragPercentage = (event.deltaX / containerWidth) * 100;
    if (this.isRTL) {
      this.translateX = this.dragStartTranslateX - dragPercentage;
    } else {
      this.translateX = this.dragStartTranslateX + dragPercentage;
    }
    this.cdr.detectChanges();
  }
  private onDragEnd(event: any): void {
    if (!this.isDragging || !this.isDraggable) return;

    this.isDragging = false;
    this.isTransitionEnabled = true; // Re-enable transitions
    const containerWidth = this.numberOfRows > 1 ? this.multiRowSlider.nativeElement.offsetWidth : this.singleRowSlider.nativeElement.offsetWidth; const dragPercentage = Math.abs(event.deltaX) / containerWidth;
    const stepWidth = 100 / this.numberOfVisibleItems; // Width of one visible item in percentage
    const stepsToMove = Math.ceil((dragPercentage * 100) / stepWidth);
    const dragDistance = Math.abs(event.deltaX);
    const shouldMove = dragDistance > this.dragThreshold && stepsToMove > 0;

    if (shouldMove) {
      let targetIndex = this.currentIndex;

      if (this.isRTL) {
        if (event.deltaX > 0) {
          targetIndex = Math.min(
            this.currentIndex + this.stepSize,
            this.maxCurrentIndex
          );
        } else {
          targetIndex = Math.max(this.currentIndex - this.stepSize, 0);
        }
      } else {
        if (event.deltaX > 0) {
          targetIndex = Math.max(this.currentIndex - this.stepSize, 0);
        } else {
          targetIndex = Math.min(
            this.currentIndex + this.stepSize,
            this.maxCurrentIndex
          );
        }
      }
      this.currentIndex = targetIndex;
      this.calculateSliderPosition();
    } else {
      this.calculateSliderPosition();
    }
    if (this.sliderOptions.autoplay) {
      this.startAutoplay();
    }
  }
  // autoplay
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
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    if (this.hammer) {
      this.hammer.destroy();
    }
  }
}
