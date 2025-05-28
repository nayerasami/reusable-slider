import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ContentChild, ElementRef, HostListener, Input, OnInit, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { ResponsiveConfig, SliderOptions, CustomSliderItems, } from './interfaces/sliderTypes';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-slider',
  imports: [CommonModule],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.css'
})
export class SliderComponent implements OnInit {
  constructor(private cdr: ChangeDetectorRef, private sanitizer: DomSanitizer) { }
  @ContentChild('itemTemplate') itemTemplate!: TemplateRef<any>;
  @ViewChild('sliderWrapper', { static: true }) sliderMain!: ElementRef;
  @Input() responsiveOptions: any;
  @Input() sliderOptions: any
  @Input() sliderItems: any[] = [];
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
  translateX: number = 0;
  isRTL: boolean = false;
  animationSpeed: string = '0.6s';
  animation: string = 'linear';
  numberOfVisibleItems: number = 4;
  maxCurrentIndex: any;
  spaceBetween: number = 0;
  clonedSliderItems: any[] = [];
  // Drag properties
  isDragging: boolean = false;
  startX = 0;
  currentX = 0;
  dragThreshold = 20; // Minimum distance to trigger slide change
  dragOffset = 0;
  initialTranslateX = 0;
  safePrevButton: any;
  safeNextButton: any;
  customSliderItems: any = {};
  numberOfRows: number = 1;
  rowsArray: any[] = [];
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sliderItems'] || changes['sliderOptions']) {
      this.calculateSliderPosition();
      this.stepSize = this.sliderOptions.stepSize || 1;
      this.numberOfVisibleItems = this.sliderOptions.numberOfVisibleItems;
      this.numberOfRows = this.sliderOptions.rows || 1
      this.maxCurrentIndex = (this.sliderItems.length - 1) - (this.numberOfVisibleItems - this.stepSize)
      const indicatorsNumber = (((this.sliderItems.length / this.numberOfRows) - this.sliderOptions.numberOfVisibleItems) / this.stepSize) + 1
      this.indicatorsLength = Math.ceil(indicatorsNumber);
      this.indicatorsArray = Array.from({ length: this.indicatorsLength }, (_, i) => i);
      this.spaceBetween = this.sliderOptions.spaceBetween || 12
      this.isRTL = this.sliderOptions.rtl || false;
      this.animationSpeed = this.sliderOptions.animationSpeed || '0.6s';
      this.animation = this.sliderOptions.animation || 'linear';
      this.clonedSliderItems = [...this.sliderItems];
      this.safeNextButton = this.sliderOptions.nextButton ? this.sanitizer.bypassSecurityTrustHtml(this.sliderOptions.nextButton) : '';
      this.safePrevButton = this.sliderOptions.prevButton ? this.sanitizer.bypassSecurityTrustHtml(this.sliderOptions.prevButton) : '';
      this.rowsArray = Array.from({ length: this.sliderOptions.rows }, (_, i) => i)

      for (let key = 0; key < this.sliderOptions.rows; key++) {
        this.customSliderItems[key] = [
        ]
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

  ngOnInit(): void {
    window.addEventListener('resize', this.onWindowResize.bind(this));
    // this.applyResponsiveOptions()
    // if (this.sliderOptions.autoplay) {
    //   this.startAutoplay();
    // }
    if (this.responsiveOptions.length) {
      this.sortedResponsiveOptons = this.responsiveOptions.sort((a: any, b: any) => parseInt(a.breakpoint.replace('px', ''), 10) - parseInt(b.breakpoint.replace('px', ''), 10));
      this.largestBreakpoint = this.sortedResponsiveOptons.pop();
      this.applyResponsiveOptions();
      this.calculateSliderPosition();
    }

  }

  onWindowResize = () => {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.applyResponsiveOptions();
      this.calculateSliderPosition(); this.cdr.detectChanges();
    }, 0);
  }

  trackItemFun(item: any, index: any) {
    return index
  }

  calculateSliderPosition() {
    // Calculate the width of each item including space between
    const itemWidth = 100 / this.sliderOptions.numberOfVisibleItems;
    // Calculate translate position based on current index
    if (this.isRTL) {
      this.translateX = +(this.currentIndex * itemWidth);
    } else {
      this.translateX = -(this.currentIndex * itemWidth);
    }
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
          numberOfVisibleItems: config.numVisible
        };
        this.numberOfVisibleItems = config.numVisible;
        this.stepSize = config.numScroll;
        this.maxCurrentIndex = ((this.sliderItems.length - 1) / this.numberOfRows) - (config.numVisible - config.numScroll);

        const indicatorsNumber = (((this.sliderItems.length / this.numberOfRows) - config.numVisible) / config.numScroll) + 1;
        this.indicatorsLength = Math.ceil(indicatorsNumber);
        this.indicatorsArray = Array.from({ length: this.indicatorsLength }, (_, i) => i);

        configFound = true;
        break;
      }
    }

    // use largest breakpoint (desktop default) if no matching breakpoint
    if (!configFound && this.largestBreakpoint) {
      this.sliderOptions = {
        ...this.sliderOptions,
        numberOfVisibleItems: this.largestBreakpoint.numVisible
      };
      this.numberOfVisibleItems = this.largestBreakpoint.numVisible;
      this.stepSize = this.largestBreakpoint.numScroll || 1;

      const indicatorsNumber = (((this.sliderItems.length / this.numberOfRows) - this.largestBreakpoint.numVisible) / this.stepSize) + 1;
      this.indicatorsLength = Math.ceil(indicatorsNumber);
      this.indicatorsArray = Array.from({ length: this.indicatorsLength }, (_, i) => i);
      this.maxCurrentIndex = ((this.sliderItems.length - 1) / this.numberOfRows) - (this.largestBreakpoint.numVisible - this.stepSize);
    }

    // Reset current index if it exceeds the new maximum
    if (this.currentIndex > this.maxCurrentIndex) {
      this.currentIndex = 0;
    }

    this.cdr.detectChanges();
  }

  nextFunc() {
    const step = this.stepSize;
    const maxIndex = Math.ceil((this.sliderItems.length / this.numberOfRows)  - this.sliderOptions.numberOfVisibleItems);
    if (this.sliderOptions.infiniteScroll) {
      if (this.isRTL) {
        this.currentIndex -= step;
        if (this.currentIndex < 0) {
          const totalItems = this.sliderItems.length;
          this.currentIndex = totalItems - (totalItems % step || step);
        }
      } else {
        this.currentIndex += step;
        if (this.currentIndex > this.maxCurrentIndex) {
          this.currentIndex = 0;
        }
      }

    } else {
      if (this.isRTL) {
        if (this.currentIndex - step >= 0) {
          this.currentIndex -= step;
        }
      } else {
        if (this.currentIndex + step <= maxIndex) {
          this.currentIndex += step;
        }
      }

    }
    this.calculateSliderPosition();

  }

  prevFunc() {
    const step = this.stepSize;
    const maxIndex = Math.ceil((this.sliderItems.length / this.numberOfRows) - this.sliderOptions.numberOfVisibleItems);
    if (this.sliderOptions.infiniteScroll) {
      if (this.isRTL) {
        this.currentIndex += step;
        if (this.currentIndex > this.maxCurrentIndex) {
          this.currentIndex = 0;
        }
      } else {
        this.currentIndex -= step;
        if (this.currentIndex < 0) {
          const totalItems = this.sliderItems.length;
          this.currentIndex = totalItems - (totalItems % step || step);
        }
      }

    } else {
      if (this.isRTL) {
        if (this.currentIndex + step <= maxIndex) {
          this.currentIndex += step;
        }
      } else {
        if (this.currentIndex - step >= 0) {
          this.currentIndex -= step;
        }
      }

    }

    this.calculateSliderPosition();
  }

  // indicators
  goToSlide(indicatorIndex: number): void {
    this.currentIndex = Math.min(indicatorIndex * this.stepSize, this.maxCurrentIndex);
    this.calculateSliderPosition();
  }
  getCurrentIndicatorIndex(): number {
    return Math.floor(this.currentIndex / this.stepSize);
  }



  // drag
  private getX(event: MouseEvent | TouchEvent): number {
    return event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
  }


  onDragStart(event: MouseEvent | TouchEvent): void {
    if (!this.sliderOptions.isDraggable) return;

    // event.preventDefault();
    this.isDragging = true;
    this.startX = this.getX(event);
    this.currentX = this.startX;
    this.initialTranslateX = this.translateX;
    this.dragOffset = 0;

    // Stop autoplay during drag
    if (this.sliderOptions.autoplay) {
      this.stopAutoplay();
    }
  }

  onDragMove(event: MouseEvent | TouchEvent): void {
    if (!this.isDragging || !this.sliderOptions.isDraggable) return;

    //  event.preventDefault();
    this.currentX = this.getX(event);
    this.dragOffset = this.currentX - this.startX;

    // Calculate the percentage offset based on container width
    const containerWidth = this.sliderMain.nativeElement.offsetWidth;
    const dragPercentage = (this.dragOffset / containerWidth) * 100;

    // Apply drag offset to current translate position
    if (this.isRTL) {
      this.translateX = this.initialTranslateX - dragPercentage;
    } else {
      this.translateX = this.initialTranslateX + dragPercentage;
    }
  }

  onDragEnd(event: MouseEvent | TouchEvent): void {
    if (!this.isDragging || !this.sliderOptions.isDraggable) return;

    this.isDragging = false;

    // Determine if drag was significant enough to change slide
    const dragDistance = Math.abs(this.dragOffset);

    if (dragDistance > this.dragThreshold) {
      // Determine direction and trigger appropriate slide change
      if (this.isRTL) {
        if (this.dragOffset > 0) {
          this.nextFunc();
        } else {
          this.prevFunc();
        }
      } else {
        if (this.dragOffset > 0) {
          this.prevFunc();
        } else {
          this.nextFunc();
        }
      }
    } else {
      // Snap back to current position
      this.calculateSliderPosition();
    }

    // Reset drag properties
    this.dragOffset = 0;
    this.startX = 0;
    this.currentX = 0;
    this.initialTranslateX = 0;

    // Restart autoplay if enabled
    if (this.sliderOptions.autoplay) {
      this.startAutoplay();
    }
  }

  @HostListener('window:mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    if (this.isDragging) {
      this.onDragEnd(event);
    }
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.isDragging) {
      this.onDragMove(event);
    }
  }

  @HostListener('window:touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    if (this.isDragging) {
      this.onDragEnd(event);
    }
  }

  @HostListener('window:touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    if (this.isDragging) {
      this.onDragMove(event);
    }
  }


  // autoplay
  startAutoplay(): void {
    if (this.sliderOptions.autoplay) {
      this.autoplayInterval = setInterval(() => {
        this.nextFunc();
      }, this.sliderOptions.autoplaySpeed || 1000); //default 3s
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
