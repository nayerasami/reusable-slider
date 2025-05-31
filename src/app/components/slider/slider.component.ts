import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ContentChild, ElementRef, HostListener, Input, OnInit, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { ResponsiveConfig, SliderOptions, CustomSliderItems, } from './interfaces/sliderTypes';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import Hammer from 'hammerjs';
@Component({
  selector: 'app-slider',
  imports: [CommonModule],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.css'
})
export class SliderComponent implements OnInit {
  constructor(private cdr: ChangeDetectorRef, private sanitizer: DomSanitizer) { }
  @ContentChild('itemTemplate') itemTemplate!: TemplateRef<any>;
  @ViewChild('singleRowSlider', { static: false }) singleRowSlider!: ElementRef;
  @ViewChild('multiRowSlider', { static: false }) multiRowSlider!: ElementRef;
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
  //isDragging: boolean = false;
  // startX = 0;
  // currentX = 0;
  // dragThreshold = 20; // Minimum distance to trigger slide change
  // dragOffset = 0;
  initialTranslateX = 0;
  safePrevButton: any;
  safeNextButton: any;
  customSliderItems: any = {};
  numberOfRows: number = 1;
  rowsArray: any[] = [];
  isTransitionEnabled = true;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sliderItems'] || changes['sliderOptions']) {
      this.calculateSliderPosition();
      this.stepSize = this.sliderOptions.stepSize || 1;
      this.numberOfVisibleItems = this.sliderOptions.numberOfVisibleItems;
      this.numberOfRows = this.sliderOptions.rows || 1
      this.maxCurrentIndex = ((this.sliderItems.length - 1) / this.numberOfRows) - (this.numberOfVisibleItems - this.stepSize)
     // this.maxCurrentIndex = Math.ceil((this.sliderItems.length / this.numberOfRows) - (this.numberOfVisibleItems - this.stepSize));
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
  hammer?: HammerManager;
  isDragging: boolean = false;
  dragStartTranslateX: number = 0;
  dragThreshold: number = 50; // Minimum drag distance to trigger slide change

  ngAfterViewInit() {
    setTimeout(() => {
      this.initializeHammer();
    }, 0);
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
      const itemWidth = 100 / this.sliderOptions.numberOfVisibleItems;
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
    let isLastStep;
    let maxIndex = Math.ceil((this.sliderItems.length / this.numberOfRows) - this.sliderOptions.numberOfVisibleItems);
    console.log(maxIndex, ' max')
    if (this.sliderOptions.infiniteScroll) {

      if (this.isRTL) {
        this.currentIndex -= step;
        if (this.currentIndex < 0) {
          const totalItems = this.sliderItems.length;
          this.currentIndex = totalItems - (totalItems % step || step);
        }
      } else {

        console.log(this.maxCurrentIndex , 'max current index')
        console.log(this.currentIndex ,'current index')
        if (this.currentIndex == this.maxCurrentIndex-1) {

          isLastStep = true;
          const itemsToMove = this.sliderItems.splice(0, this.numberOfVisibleItems);
          const otherItems = [...this.sliderItems]
          //   this.sliderItems = [];
          //this.sliderItems.push(...itemsToMove);
          this.sliderItems.push(...otherItems, ...this.clonedSliderItems);
          //this.currentIndex=0;
          // console.log(this.sliderItems, 'slider itemms');

        } else {
          this.currentIndex += step;
        }

      }
    } else {
      if (this.isRTL) {
        if (this.currentIndex - step >= 0) {
          this.currentIndex -= step;
        }
      } else {
        if (this.currentIndex + step <= this.maxCurrentIndex) {
          this.currentIndex += step;
        }
      }
    this.calculateSliderPosition();

    }

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
        if (this.currentIndex + step <= this.maxCurrentIndex) {
          this.currentIndex += step;
        }
      } else {
        if (this.currentIndex - step >= 0) {
          this.currentIndex -= step;
        }
      }
       this.calculateSliderPosition();
    }

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
  private initializeHammer() {
    // Determine which slider element is active based on rows configuration
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
      threshold: 10
    });

    // Handle pan start
    this.hammer.on('panstart', (ev) => {
      this.onDragStart(ev);
    });

    // Handle pan move
    this.hammer.on('panmove', (ev) => {
      this.onDragMove(ev);
    });

    // Handle pan end
    this.hammer.on('panend', (ev) => {
      this.onDragEnd(ev);
    });
  }

  private onDragStart(event: any): void {
    ;
    if (!this.sliderOptions.isDraggable) return;

    this.isDragging = true;
    this.dragStartTranslateX = this.translateX;
    console.log(this.dragStartTranslateX, ' drag start translate X')
    if (this.sliderOptions.autoplay) {
      this.stopAutoplay();
    }

    this.isTransitionEnabled = false;
  }

  private onDragMove(event: any): void {
    if (!this.isDragging || !this.sliderOptions.isDraggable) return;

    // Calculate drag percentage based on container width
    const containerWidth = this.numberOfRows > 1 ? this.multiRowSlider.nativeElement.offsetWidth : this.singleRowSlider.nativeElement.offsetWidth;
    const dragPercentage = (event.deltaX / containerWidth) * 100;

    // Apply drag offset to current translate position
    if (this.isRTL) {
      this.translateX = this.dragStartTranslateX - dragPercentage;
    } else {
      this.translateX = this.dragStartTranslateX + dragPercentage;
    }

    // Trigger change detection to update the view
    this.cdr.detectChanges();
  }


  private onDragEnd(event: any): void {
    if (!this.isDragging || !this.sliderOptions.isDraggable) return;

    this.isDragging = false;
    this.isTransitionEnabled = true; // Re-enable transitions

    // Calculate drag percentage relative to container width
    const containerWidth = this.numberOfRows > 1 ? this.multiRowSlider.nativeElement.offsetWidth : this.singleRowSlider.nativeElement.offsetWidth;
    const dragPercentage = Math.abs(event.deltaX) / containerWidth;

    // Calculate how many steps the drag represents
    const stepWidth = 100 / this.numberOfVisibleItems; // Width of one visible item in percentage
    const stepsToMove = Math.ceil((dragPercentage * 100) / stepWidth);

    // Only move if drag exceeds threshold AND represents at least one step
    const dragDistance = Math.abs(event.deltaX);
    const shouldMove = dragDistance > this.dragThreshold && stepsToMove > 0;

    if (shouldMove) {
      // Calculate target index based on stepSize and drag direction
      let targetIndex = this.currentIndex;

      if (this.isRTL) {
        if (event.deltaX > 0) {
          // Dragging right in RTL = next
          targetIndex = Math.min(this.currentIndex + this.stepSize, this.maxCurrentIndex);
        } else {
          // Dragging left in RTL = previous
          targetIndex = Math.max(this.currentIndex - this.stepSize, 0);
        }
      } else {
        if (event.deltaX > 0) {
          // Dragging right in LTR = previous
          targetIndex = Math.max(this.currentIndex - this.stepSize, 0);
        } else {
          // Dragging left in LTR = next
          targetIndex = Math.min(this.currentIndex + this.stepSize, this.maxCurrentIndex);
        }
      }

      // Set the new index and calculate position
      this.currentIndex = targetIndex;
      this.calculateSliderPosition();
    } else {
      // Snap back to current position if drag wasn't significant
      this.calculateSliderPosition();
    }

    // Restart autoplay if enabled
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
  }

}
