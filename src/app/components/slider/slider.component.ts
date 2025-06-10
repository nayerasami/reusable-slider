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
  standalone: true,
  imports: [CommonModule],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.scss',
})
export class SliderComponent implements OnInit {
  constructor( private cdr: ChangeDetectorRef, private sanitizer: DomSanitizer) {}
  @ContentChild('itemTemplate') itemTemplate!: TemplateRef<any>;
  @ViewChild('rowSlider', { static: false }) rowSlider!: ElementRef;
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
  clonedCustomSliderItems:any ={};
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
      this.safePrevButton = this.sliderOptions.prevButton ? this.sanitizer.bypassSecurityTrustHtml(this.sliderOptions.prevButton): '';
      this.isDraggable = this.sliderOptions.isDraggable ?? true;
      this.isInfiniteScroll = this.sliderOptions.infiniteScroll ?? false;
      this.rowsArray = Array.from( { length: this.sliderOptions.rows },(_, i) => i);
      this.calculateIndicators();
      this.handleInfiniteScrollSliderItems();
      this.handleMoreThanOneRowSliderItems();

      
      if (this.sliderOptions.autoplay) {
        this.startAutoplay();
      }
    }
    if (changes['responsiveOptions']) {
      if (this.responsiveOptions && this.responsiveOptions.length > 0) {
        this.sortedResponsiveOptons = [...this.responsiveOptions].sort((a, b) =>
          parseInt(a.breakpoint.replace('px', ''), 10) - parseInt(b.breakpoint.replace('px', ''), 10)
        );
        this.applyResponsiveOptions();
      } else {
        this.setDefaultSliderSettings();
      }
      this.calculateSliderPosition();

    }
  }
  handleMoreThanOneRowSliderItems() {
    if (this.numberOfRows > 1) {
      for (let key = 0; key < this.sliderOptions.rows; key++) {
        this.customSliderItems[key] = [];
      }
      for ( let i = 0; i < this.sliderItems.length; i += this.sliderOptions.rows ) {
        for (let j = 0; j < this.sliderOptions.rows; j++) {
          const item = this.sliderItems[i + j];
          if (item !== undefined) {
            this.customSliderItems[j].push(item);
          }
        }
      }
   
    this.clonedCustomSliderItems = {};
    for (let key in this.customSliderItems) {
      this.clonedCustomSliderItems[key] = [...this.customSliderItems[key]];
    } 
    }
  }
  setDefaultSliderSettings(): void {
    if (this.sliderOptions) {
      this.numberOfVisibleItems = this.sliderOptions.numberOfVisibleItems || 4;
      this.stepSize = this.sliderOptions.stepSize || 1;
      this.calculateIndicators();
    }
  }
  calculateIndicators() {
    if (this.isInfiniteScroll) {
      const originalLength = this.clonedSliderItems.length;
      const totalSlides = Math.ceil(originalLength / this.stepSize);
      this.indicatorsLength = totalSlides;
      this.indicatorsArray = Array.from( { length: this.indicatorsLength }, (_, i) => i);
      this.maxCurrentIndex = originalLength - this.numberOfVisibleItems;
    } else {
      const totalSlides = (this.clonedSliderItems.length / this.numberOfRows - this.numberOfVisibleItems) / this.stepSize + 1;
      this.indicatorsLength = Math.ceil(totalSlides);
      this.indicatorsArray = Array.from( { length: this.indicatorsLength },(_, i) => i );
      this.maxCurrentIndex =(this.sliderItems.length - 1) / this.numberOfRows - (this.numberOfVisibleItems - this.stepSize);
    }
  }
  handleInfiniteScrollSliderItems() {
  if(this.numberOfRows == 1 ){
     if (!this.isInfiniteScroll) {
      this.sliderItems = [...this.clonedSliderItems];
      this.currentIndex = 0;
      this.translateX = 0;
    } else{
      if(this.sliderItems.length >= this.numberOfVisibleItems){
      this.sliderItems = [...this.clonedSliderItems];
      const startClone = this.sliderItems.slice(0, this.numberOfVisibleItems);
      const endClone = this.sliderItems.slice(-this.numberOfVisibleItems);
      this.sliderItems = [...endClone, ...this.sliderItems, ...startClone];
      this.currentIndex = this.numberOfVisibleItems;
      this.translateX = - (this.currentIndex * (100 / this.numberOfVisibleItems));
      }
    }
  }else{
      if (this.clonedSliderItems.length < this.numberOfVisibleItems * this.numberOfRows) {
        this.isInfiniteScroll = false;
        this.sliderItems = [...this.clonedSliderItems];
        this.handleMoreThanOneRowSliderItems();
        this.currentIndex = 0;
        this.translateX = 0;
        this.calculateIndicators();
        return;
      }
        for(let key in this.clonedCustomSliderItems){
            if (this.clonedCustomSliderItems[key].length >= this.numberOfVisibleItems) {
              this.customSliderItems[key] = [...this.clonedCustomSliderItems[key]];
              const startClone =  this.customSliderItems[key].slice(0,this.numberOfVisibleItems);
              const endClone =  this.customSliderItems[key].slice(-this.numberOfVisibleItems);
              this.customSliderItems[key]=[...endClone , ...this.customSliderItems[key],...startClone]
            }
        }
        this.currentIndex = this.numberOfVisibleItems;
        this.translateX = -(this.currentIndex * (100 / this.numberOfVisibleItems));
              }
  }

  ngOnInit(): void {
    window.addEventListener('resize', this.onWindowResize.bind(this));
  
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
    this.translateX = this.isRTL ? (this.translateX = +(this.currentIndex * itemWidth)) : (this.translateX = -(this.currentIndex * itemWidth));
  }

  applyResponsiveOptions(): void {
    if (!this.responsiveOptions || !Array.isArray(this.responsiveOptions) || this.responsiveOptions.length === 0) {
      this.setDefaultSliderSettings();
      return;
    }
    this.sortedResponsiveOptons = this.responsiveOptions.sort((a: any, b: any) =>
      parseInt(a.breakpoint.replace('px', ''), 10) - parseInt(b.breakpoint.replace('px', ''), 10)
    );
    const width = window.innerWidth;
    if (width > 1400) {
      this.numberOfVisibleItems = this.sliderOptions.numberOfVisibleItems || 4;
      this.stepSize = this.sliderOptions.stepSize || 1;
    } else {
      let selectedConfig = null;
      for (let config of this.sortedResponsiveOptons) {
        const breakpoint = parseInt(config.breakpoint.replace('px', ''), 10);
        if (width > breakpoint) {
          selectedConfig = config;
        } else if (width <= breakpoint) {
          selectedConfig = config;
          break;
        }
      }
      if (selectedConfig) {
        this.numberOfVisibleItems = selectedConfig.numVisible;
        this.stepSize = selectedConfig.numScroll;
      } else {
        this.numberOfVisibleItems = this.sliderOptions.numberOfVisibleItems;
        this.stepSize = this.sliderOptions.stepSize;
      }
    }

    this.sliderOptions = {
      ...this.sliderOptions,
      numberOfVisibleItems: this.numberOfVisibleItems,
      stepSize: this.stepSize,
    };

    this.calculateIndicators();
    this.handleInfiniteScrollSliderItems();

    if (!this.isInfiniteScroll && this.currentIndex > this.maxCurrentIndex) {
      this.currentIndex = 0;
      this.calculateSliderPosition();
    }
    this.cdr.detectChanges();
  }

  slideFinite(direction: 'forward' | 'backward'): void {
    const dir = this.isRTL ? -1 : 1;
    const movement = direction === 'forward' ? 1 : -1;
    const newIndex = this.currentIndex + dir * this.stepSize * movement;
    if (newIndex >= 0 && newIndex <= this.maxCurrentIndex) {
      this.currentIndex = newIndex;
      this.calculateSliderPosition();
    }
  }

  slideInfinite(direction: 'forward' | 'backward'): void {
    const dir = this.isRTL ? -1 : 1;
    const movement = direction === 'forward' ? 1 : -1;
    const step = dir * this.stepSize * movement;

    if (this.numberOfRows === 1) {
      if (this.sliderItems.length < this.numberOfVisibleItems) return;

      this.currentIndex += step;
      this.isTransitionEnabled = true;
      this.calculateSliderPosition();

      const timeout = parseFloat(this.animationSpeed) * 1000;
      setTimeout(() => {
        this.isTransitionEnabled = false;
        if (this.currentIndex >= this.sliderItems.length - this.numberOfVisibleItems) {
          this.currentIndex = this.numberOfVisibleItems;
        } else if (this.currentIndex < this.numberOfVisibleItems) {
          this.currentIndex = this.sliderItems.length - 2 * this.numberOfVisibleItems;
        }
        this.calculateSliderPosition();
      }, timeout);
    } else {
      if (this.clonedSliderItems.length < this.numberOfVisibleItems * this.numberOfRows) return;

      this.currentIndex += step;
      this.isTransitionEnabled = true;
      this.calculateSliderPosition();

      const timeout = parseFloat(this.animationSpeed) * 1000;
      setTimeout(() => {
        this.isTransitionEnabled = false;
        const cloneCount = Math.max(this.numberOfVisibleItems, this.stepSize);
        const itemsPerRow = this.clonedCustomSliderItems[0].length;
        const totalItemsPerRow = itemsPerRow + 2 * cloneCount; // Including clones
        if (this.currentIndex >= totalItemsPerRow - this.numberOfVisibleItems) {
          this.currentIndex = cloneCount + (this.currentIndex - (itemsPerRow + cloneCount));
        } else if (this.currentIndex < cloneCount) {
          this.currentIndex = itemsPerRow + cloneCount - (cloneCount - this.currentIndex);
        }
        this.calculateSliderPosition();
      }, timeout);
    }
  }



  nextFunc(): void {
    if (this.isInfiniteScroll) {
      this.slideInfinite('forward');
    } else {
      this.slideFinite('forward');
    }
  }

  prevFunc(): void {
    if (this.isInfiniteScroll) {
      this.slideInfinite('backward');
    } else {
      this.slideFinite('backward');
    }
  }

  // indicators
  goToSlide(index: number): void {
    this.currentIndex = this.isInfiniteScroll ? this.numberOfVisibleItems + index * this.stepSize : Math.min(index * this.stepSize, this.maxCurrentIndex);
    this.isTransitionEnabled = true;
    this.calculateSliderPosition();
  }

  getCurrentIndicator(): number {
    if (!this.isInfiniteScroll) {
      return Math.floor(this.currentIndex / this.stepSize);
    }
    let normalizedIndex = this.currentIndex - this.numberOfVisibleItems;
    if (normalizedIndex < 0) {
      normalizedIndex = this.clonedSliderItems.length + normalizedIndex;
    } else if (normalizedIndex >= this.clonedSliderItems.length) {
      normalizedIndex = normalizedIndex - this.clonedSliderItems.length;
    }
    normalizedIndex = Math.max(0,Math.min(normalizedIndex, this.clonedSliderItems.length - 1));
    return Math.floor(normalizedIndex / this.stepSize);
  }

  // drag
  private initializeHammer() {
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
    this.hammer.on('panstart', (ev: any) => {
      this.onDragStart(ev);
    });
    this.hammer.on('panmove', (ev: any) => {
      this.onDragMove(ev);
    });
    this.hammer.on('panend', (ev: any) => {
      this.onDragEnd(ev);
    });
  }

  private onDragStart(event: any): void {
    if ( !this.isDraggable || this.sliderItems.length <= this.numberOfVisibleItems ) return;
    this.isDragging = true;
    this.dragStartTranslateX = this.translateX;
    if (this.sliderOptions.autoplay) {
      this.stopAutoplay();
    }
    this.isTransitionEnabled = false;
  }

  private onDragMove(event: any): void {
    if (!this.isDragging ||!this.isDraggable || this.sliderItems.length <= this.numberOfVisibleItems) return;
    const containerWidth = this.rowSlider.nativeElement.offsetWidth;
    const dragPercentage = (event.deltaX / containerWidth) * 100;
    this.translateX = this.dragStartTranslateX + dragPercentage;
    this.cdr.detectChanges();
  }

  private onDragEnd(event: any): void {
    if ( !this.isDragging ||!this.isDraggable ||  this.sliderItems.length <= this.numberOfVisibleItems)return;
    this.isDragging = false;
    this.isTransitionEnabled = true;
    const dragDistance = Math.abs(event.deltaX);
    // Check if drag distance exceeds threshold
    if (dragDistance < this.dragThreshold) {
      // Reset to original position if drag was too small
      this.calculateSliderPosition();
      if (this.sliderOptions.autoplay) {
        this.startAutoplay();
      }
      return;
    }
    let shouldMove = false;
    if (this.isInfiniteScroll) {
      shouldMove = true;
    } else {
      if (event.deltaX < 0) {
        shouldMove = this.isRTL ? this.currentIndex > 0 : this.currentIndex <= this.maxCurrentIndex - this.stepSize;
      } else {
        shouldMove = this.isRTL  ? this.currentIndex <= this.maxCurrentIndex - this.stepSize : this.currentIndex > 0;
      }
    }
    if (shouldMove) {
      if (this.isRTL) {
        if (event.deltaX < 0) {
          this.nextFunc();
        } else {
          this.prevFunc();
        }
      } else {
        if (event.deltaX < 0) {
          this.nextFunc();
        } else {
          this.prevFunc();
        }
      }
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
