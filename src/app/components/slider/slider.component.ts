import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ContentChild, ElementRef, HostListener, Input, OnInit, QueryList, SimpleChanges, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { ResponsiveConfig, SliderOptions } from './interfaces/sliderTypes';
import { DomSanitizer } from '@angular/platform-browser';
import Hammer from 'hammerjs';
@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.scss',
})
export class SliderComponent implements OnInit {
  constructor(private cdr: ChangeDetectorRef, private sanitizer: DomSanitizer) { }
  @ContentChild('itemTemplate') itemTemplate!: TemplateRef<any>;
  @ViewChild('rowSlider', { static: false }) rowSlider!: ElementRef;
  @ViewChildren('galleryImage') galleryImagesIndicators!: QueryList<ElementRef>;
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
  translateY: number = 0;
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
  clonedCustomSliderItems: any = {};
  numberOfRows: number = 1;
  rowsArray: any[] = [];
  isTransitionEnabled = true;
  hammer?: HammerManager;
  isDragging: boolean = false;
  dragStartTranslateX: number = 0;
  dragStartTranslateY: number = 0;
  dragThreshold: number = 50;
  isDraggable: boolean = true;
  isInfiniteScroll: boolean = false;
  maxArrayKey: any;
  autoplay: boolean = false;
  isExternalDrag = false;
  shouldReInitializeHammer: boolean = false;
  customIndicators: any;
  isVertical: boolean = false;
  galleryImages: any;
  height: string = '300px';
  @HostListener('document:click', ['$event'])
  onSelectStart(event: Event): void {
    this.isDragging = false;
    if (!this.isDragging && this.shouldReInitializeHammer) {
      this.initializeHammer()
      this.shouldReInitializeHammer = false;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sliderItems'] || changes['sliderOptions']) {
      this.calculateSliderPosition();
      this.clonedSliderItems = [...this.sliderItems];
      this.stepSize = this.sliderOptions.stepSize;
      this.numberOfVisibleItems = this.sliderOptions.numberOfVisibleItems;
      this.numberOfRows = this.sliderOptions.rows ?? 1;
      this.isVertical = this.sliderOptions.vertical ?? false;
      if (this.isVertical && this.numberOfRows > 1) {
        this.numberOfRows = 1;
      }
      this.spaceBetween = this.sliderOptions.spaceBetween ?? 0;
      this.isRTL = this.sliderOptions.rtl || false;
      this.animationSpeed = this.sliderOptions.animationSpeed ?? '0.6s';
      this.animation = this.sliderOptions.animation ?? 'linear';
      this.safeNextButton = this.sliderOptions.nextButton ? this.sanitizer.bypassSecurityTrustHtml(this.sliderOptions.nextButton) : '';
      this.safePrevButton = this.sliderOptions.prevButton ? this.sanitizer.bypassSecurityTrustHtml(this.sliderOptions.prevButton) : '';
      this.isDraggable = this.sliderOptions.isDraggable ?? true;
      if ((this.sliderItems.length / this.numberOfRows <= this.numberOfVisibleItems)) {
        this.isDraggable = false;
      }
      this.isInfiniteScroll = this.sliderOptions.infiniteScroll ?? false;
      this.autoplay = this.sliderOptions.autoplay ?? false;
      this.rowsArray = Array.from({ length: this.numberOfRows }, (_, i) => i);
      this.customIndicators = this.sliderOptions.customIndicators;
      this.galleryImages = this.sliderOptions.galleryImages ?? [];
      this.height = this.sliderOptions.height;
      this.calculateIndicators();
      this.handleInfiniteScrollSliderItems();
      this.handleMoreThanOneRowSliderItems();
      if (!this.isInfiniteScroll) {
        this.currentIndex = 0;
        this.calculateSliderPosition();
      }
      if (this.autoplay) {
        this.startAutoplay();
      }
    }
    if (changes['responsiveOptions'] || changes['sliderOptions']) {
      if (this.responsiveOptions && this.responsiveOptions.length > 0) {
        this.sortedResponsiveOptons = [...this.responsiveOptions].sort((a, b) =>
          parseInt(a.breakpoint.replace('px', ''), 10) - parseInt(b.breakpoint.replace('px', ''), 10)
        );
        const largestBreakpoint = this.sortedResponsiveOptons[this.sortedResponsiveOptons.length - 1];
        if (!this.sliderOptions.numberOfVisibleItems || !this.sliderOptions.stepSize) {
          this.sliderOptions = {
            ...this.sliderOptions,
            numberOfVisibleItems: this.sliderOptions.numberOfVisibleItems ?? largestBreakpoint.numVisible,
            stepSize: this.sliderOptions.numberOfVisibleItems ?? largestBreakpoint.numScroll
          }
        }
        this.applyResponsiveOptions();
      } else {
        this.setDefaultSliderSettings();
      }

      this.calculateSliderPosition();

    }
  }

  handleMoreThanOneRowSliderItems() {
    if (this.numberOfRows > 1) {
      for (let key = 0; key < this.numberOfRows; key++) {
        this.customSliderItems[key] = [];
      }
      for (let i = 0; i < this.sliderItems.length; i += this.numberOfRows) {
        for (let j = 0; j < this.numberOfRows; j++) {
          const item = this.sliderItems[i + j];
          if (item !== undefined) {
            this.customSliderItems[j].push(item);
          }
        }
      }

      if (this.isInfiniteScroll) {
        let maxArrayLength = 0;
        let maxArrayKey = 0;
        this.clonedCustomSliderItems = {};
        for (let key in this.customSliderItems) {
          this.clonedCustomSliderItems[key] = [...this.customSliderItems[key]];
          if (this.clonedCustomSliderItems[key].length > (this.sliderItems.length / this.numberOfRows)) {
            maxArrayKey = +key;
            maxArrayLength = this.clonedCustomSliderItems[key].length;
          }
        }
        if (this.sliderItems.length % this.numberOfRows !== 0) {
          const virtualItemsArray = Array.from({ length: 1 }, () => ({ id: null, type: 'virtual' }));
          for (let key in this.clonedCustomSliderItems) {
            if (+key > +maxArrayKey) {
              this.clonedCustomSliderItems[key].push(...virtualItemsArray);
            }
          }
        }
      }

    }
  }
  setDefaultSliderSettings(): void {
    if (this.sliderOptions) {
      this.numberOfVisibleItems = this.sliderOptions.numberOfVisibleItems ?? 1;
      this.stepSize = this.sliderOptions.stepSize ?? 1;
      this.calculateIndicators();
    }
  }
  calculateIndicators() {
    if (this.isInfiniteScroll) {
      const originalLength = this.clonedSliderItems.length / this.numberOfRows;
      const totalSlides = Math.ceil(originalLength / this.stepSize);
      this.indicatorsLength = totalSlides;
      this.indicatorsArray = Array.from({ length: this.indicatorsLength }, (_, i) => i);
      this.maxCurrentIndex = Math.ceil(originalLength - this.numberOfVisibleItems);
    } else {
      const totalSlides = (this.clonedSliderItems.length / this.numberOfRows - this.numberOfVisibleItems) / this.stepSize + 1;
      this.indicatorsLength = Math.ceil(totalSlides);
      this.indicatorsArray = Array.from({ length: this.indicatorsLength }, (_, i) => i);
      this.maxCurrentIndex = Math.ceil((this.sliderItems.length - 1) / this.numberOfRows - (this.numberOfVisibleItems - this.stepSize));
    }
  }
  handleInfiniteOneRowSlider() {
    if (!this.isInfiniteScroll) {
      this.sliderItems = [...this.clonedSliderItems];
      this.currentIndex = 0;
      this.translateX = 0;
      return;
    }
    if (this.sliderItems.length >= this.numberOfVisibleItems) {
      this.sliderItems = [...this.clonedSliderItems];
      const startClone = this.sliderItems.slice(0, this.numberOfVisibleItems);
      const endClone = this.sliderItems.slice(-this.numberOfVisibleItems);
      this.sliderItems = [...endClone, ...this.sliderItems, ...startClone];
      this.currentIndex = this.numberOfVisibleItems;
      this.translateX = - (this.currentIndex * (100 / this.numberOfVisibleItems));
    }

  }
  handleInfiniteMultiRowSlider() {
    if (this.sliderItems.length / this.numberOfRows < this.numberOfVisibleItems) {
      this.isInfiniteScroll = false;
      this.sliderItems = [...this.clonedSliderItems];
      this.handleMoreThanOneRowSliderItems();
      this.currentIndex = 0;
      this.translateX = 0;
      this.calculateIndicators();
      return;
    }
    for (let key in this.clonedCustomSliderItems) {
      if (this.clonedCustomSliderItems[key].length >= this.numberOfVisibleItems) {
        this.customSliderItems[key] = [...this.clonedCustomSliderItems[key]];
        const startClone = this.customSliderItems[key].slice(0, this.numberOfVisibleItems);
        const endClone = this.customSliderItems[key].slice(-this.numberOfVisibleItems);
        this.customSliderItems[key] = [...endClone, ...this.customSliderItems[key], ...startClone]
      }
    }
    this.currentIndex = this.numberOfVisibleItems;
    this.translateX = -(this.currentIndex * (100 / this.numberOfVisibleItems));
  }
  handleInfiniteScrollSliderItems() {
    if (this.isInfiniteScroll) {
      if (this.numberOfRows == 1) {
        this.handleInfiniteOneRowSlider();
      } else {
        this.handleInfiniteMultiRowSlider();
      }
    }

  }
  isPrevDisabled(): boolean {
    const boundry = this.isRTL ? this.indicatorsArray.length - 1 : 0
    return !this.isInfiniteScroll && this.getCurrentIndicator() === boundry
  }

  isNextDisabled(): boolean {
    const boundry = this.isRTL ? 0 : this.indicatorsArray.length - 1
    return !this.isInfiniteScroll && this.getCurrentIndicator() === boundry
  }
  ngOnInit(): void {
    window.addEventListener('resize', this.onWindowResize.bind(this));

  }
  ngAfterViewInit() {


    setTimeout(() => {
      this.initializeHammer();
    }, 0);
  }
  setActive(index: number) {
    this.currentIndex = index;
      const activeEl = this.galleryImagesIndicators.toArray()[index]?.nativeElement;
      activeEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      if(index > this.maxCurrentIndex+1){
        index = 0;
        const activeEl = this.galleryImagesIndicators.toArray()[index]?.nativeElement;
        activeEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
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
    if (!this.isVertical) {
      const itemWidth = 100 / this.numberOfVisibleItems;
      this.translateX = this.isRTL ? (this.translateX = +(this.currentIndex * itemWidth)) : (this.translateX = -(this.currentIndex * itemWidth));
    } else {
      const itemHeight = 100 / this.numberOfVisibleItems;
      this.translateY = -((this.currentIndex * itemHeight));
    }
  }

  applyResponsiveOptions(): void {
    if (!this.responsiveOptions || !Array.isArray(this.responsiveOptions) || this.responsiveOptions.length === 0) {
      this.setDefaultSliderSettings();
      if (this.stepSize > this.numberOfVisibleItems) {
        this.stepSize = this.numberOfVisibleItems;
      }
      this.calculateIndicators();
      return;
    }
    this.sortedResponsiveOptons = this.responsiveOptions.sort((a: any, b: any) =>
      parseInt(a.breakpoint.replace('px', ''), 10) - parseInt(b.breakpoint.replace('px', ''), 10)
    );
    const width = window.innerWidth;
    const largestBreakpoint = this.sortedResponsiveOptons[this.sortedResponsiveOptons.length - 1].breakpoint.replace('px', '');
    if (width >= largestBreakpoint) {
      this.numberOfVisibleItems = this.sliderOptions.numberOfVisibleItems;
      this.stepSize = this.sliderOptions.stepSize;
      this.currentIndex = this.isInfiniteScroll ? this.numberOfVisibleItems : 0;
    } else {
      let selectedConfig = null;
      for (let config of this.sortedResponsiveOptons) {
        const breakpoint = parseInt(config.breakpoint.replace('px', ''), 10);
        if (width > breakpoint) {
          selectedConfig = config;
        } else if (width < breakpoint) {
          selectedConfig = config;
          break;
        }
      }
      if (selectedConfig) {
        this.numberOfVisibleItems = selectedConfig.numVisible;
        this.stepSize = selectedConfig.numScroll;
      }

    }
    if (this.stepSize > this.numberOfVisibleItems) {
      this.stepSize = this.numberOfVisibleItems;
    }
    this.calculateIndicators();
    this.handleInfiniteScrollSliderItems();
    this.cdr.detectChanges();
  }

  slideFinite(direction: 'forward' | 'backward'): void {
    const dir = this.isRTL ? -1 : 1;
    const movement = direction === 'forward' ? 1 : -1;
    const newIndex = this.currentIndex + dir * this.stepSize * movement;
    if (newIndex >= 0 && newIndex <= Math.ceil(this.maxCurrentIndex)) {
      this.currentIndex = newIndex;
      this.calculateSliderPosition();
    }
  }

  handleSingleRowInfiniteLoop() {
    if (this.sliderItems.length < this.numberOfVisibleItems) return;
    if (this.currentIndex >= this.sliderItems.length - this.numberOfVisibleItems) {
      this.currentIndex = this.currentIndex - this.clonedSliderItems.length;
    } else if (this.currentIndex < this.numberOfVisibleItems) {
      this.currentIndex = this.numberOfVisibleItems + this.clonedSliderItems.length - (this.numberOfVisibleItems - this.currentIndex);
    }
  }

  handleMultiRowInfiniteLoop() {
    if (this.sliderItems.length / this.numberOfRows < this.numberOfVisibleItems) return;
    const cloneCount = Math.max(this.numberOfVisibleItems, this.stepSize);
    const itemsPerRow = this.clonedCustomSliderItems[0].length;
    const totalItemsPerRow = itemsPerRow + 2 * cloneCount;
    if (this.currentIndex >= totalItemsPerRow - this.numberOfVisibleItems) {
      this.currentIndex = cloneCount + (this.currentIndex - (itemsPerRow + cloneCount));
    } else if (this.currentIndex < cloneCount) {
      this.currentIndex = itemsPerRow + cloneCount - (cloneCount - this.currentIndex);
    }
  }
  slideInfinite(direction: 'forward' | 'backward'): void {
    const dir = this.isRTL ? -1 : 1;
    const movement = direction === 'forward' ? 1 : -1;
    const step = dir * this.stepSize * movement;
    this.currentIndex += step;
    this.isTransitionEnabled = true;
    this.calculateSliderPosition();
    const timeout = parseFloat(this.animationSpeed) * 1000;
    setTimeout(() => {
      this.isTransitionEnabled = false;
      if (this.numberOfRows === 1) {
        this.handleSingleRowInfiniteLoop();
      } else {
        this.handleMultiRowInfiniteLoop();
      }
      this.calculateSliderPosition()
    }, timeout)
  }

  nextFunc(): void {
    if (this.isInfiniteScroll) {
      this.slideInfinite('forward');
    } else {
      this.slideFinite('forward');
    }
    this.setActive(this.currentIndex)

  }

  prevFunc(): void {
    if (this.isInfiniteScroll) {
      this.slideInfinite('backward');
    } else {
      this.slideFinite('backward');
    }
    this.setActive(this.currentIndex)

  }

  // indicators
  goToSlide(index: number): void {
    this.currentIndex = this.isInfiniteScroll ? this.numberOfVisibleItems + index * this.stepSize : Math.min(index * this.stepSize, this.maxCurrentIndex);
    this.isTransitionEnabled = true;
    this.calculateSliderPosition();
    this.setActive(index);
  }

  getCurrentIndicator(): number {
    if (!this.isInfiniteScroll) {
      return Math.ceil(this.currentIndex / this.stepSize);
    } else {

      let normalizedIndex = this.currentIndex - this.numberOfVisibleItems;
      if (normalizedIndex < 0) {
        normalizedIndex = this.clonedSliderItems.length + normalizedIndex;
      } else if (normalizedIndex >= this.clonedSliderItems.length) {
        normalizedIndex = normalizedIndex - this.clonedSliderItems.length;
      }
      normalizedIndex = Math.max(0, Math.min(normalizedIndex, this.clonedSliderItems.length - 1));
      return Math.floor(normalizedIndex / this.stepSize);
    }
  }
  // drag
  private initializeHammer() {
    if (this.hammer) {
      this.hammer.destroy();
    }
    let sliderElement: HTMLElement | null = null;
    if (this.rowSlider && this.rowSlider.nativeElement) {
      sliderElement = this.rowSlider.nativeElement;
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
    this.hammer.on('panstart', (ev: any) => { this.onDragStart(ev) });
    this.hammer.on('panmove', (ev: any) => { this.onDragMove(ev) });
    this.hammer.on('panend', (ev: any) => { this.onDragEnd(ev) });
    this.hammer.on('pancancel', (ev: any) => this.onDragEnd(ev));

  }

  private onDragStart(event: any): void {
    if (!this.isDraggable || (this.sliderItems.length / this.numberOfRows <= this.numberOfVisibleItems)) {
      this.isDragging = false;
      return;
    }
    this.isDragging = true;
    if (this.isVertical) {
      this.dragStartTranslateY = this.translateY
    } else {
      this.dragStartTranslateX = this.translateX;
    }
    if (this.autoplay) {
      this.stopAutoplay();
    }
    this.isTransitionEnabled = false;
    this.shouldReInitializeHammer = true
  }


  private onDragMove(event: any): void {
    if (!this.isDragging || !this.isDraggable || (this.sliderItems.length / this.numberOfRows <= this.numberOfVisibleItems)) return;
    const containerSize = this.isVertical ? this.rowSlider.nativeElement.offsetHeight : this.rowSlider.nativeElement.offsetWidth;
    const dragDirection = this.isVertical ? event.deltaY : event.deltaX;
    const dragPercentage = (dragDirection / containerSize) * 100
    if (this.isVertical) {
      this.translateY = this.dragStartTranslateY + dragPercentage;
    } else {
      this.translateX = this.dragStartTranslateX + dragPercentage;
    }
    this.cdr.detectChanges();
    this.shouldReInitializeHammer = false;
  }
  private onDragEnd(event: HammerInput): void {
    if (!this.isDragging || !this.isDraggable || this.sliderItems.length / this.numberOfRows <= this.numberOfVisibleItems) {
      return;
    }

    this.isDragging = false;
    this.isTransitionEnabled = true;
    const dragDistance = this.isVertical ? Math.abs(event.deltaY) : Math.abs(event.deltaX);
    if (dragDistance < this.dragThreshold) {
      this.calculateSliderPosition();
      if (this.sliderOptions.autoplay) {
        this.startAutoplay();
      }
      return;
    }

    let shouldMove = false;
    const isNegativeDrag = this.isVertical ? event.deltaY < 0 : event.deltaX < 0;

    if (this.isInfiniteScroll) {
      shouldMove = true;
    } else {
      const canMoveForward = this.currentIndex <= this.maxCurrentIndex - this.stepSize;
      const canMoveBackward = this.currentIndex > 0;

      if (this.isRTL) {
        shouldMove = isNegativeDrag ? canMoveBackward : canMoveForward;
      } else {
        shouldMove = isNegativeDrag ? canMoveForward : canMoveBackward;
      }
    }

    if (shouldMove) {
      const goNext = this.isRTL ? !isNegativeDrag : isNegativeDrag;
      goNext ? this.nextFunc() : this.prevFunc();
    } else {
      this.calculateSliderPosition();
    }

    if (this.sliderOptions.autoplay) {
      this.startAutoplay();
    }
  }


  // autoplay
  startAutoplay(): void {
    if (this.autoplay) {
      this.autoplayInterval = setInterval(() => {
        this.nextFunc();
      }, this.sliderOptions.autoplaySpeed || 3000); //default 3s
    }
  }
  stopAutoplay(): void {
    if (this.autoplayInterval && this.autoplay) {
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
