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
  @Input() responsiveOptions: any;
  @Input() sliderOptions: SliderOptions = {
    navButtons: true,
    autoplay: true,
    autoplaySpeed: 3000,
    indicators: true,
    infiniteScroll: true,
    isDraggable: true,
    numberOfVisibleItems: 4,
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
  translateX: number = 0;
  isRTL: boolean = false;
  animationSpeed: string = '0.6s';
  animation: string = 'linear';
  numberOfVisibleItems: number = 4;
  maxCurrentIndex: any;
  spaceBetween: number = 0;
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sliderItems'] || changes['sliderOptions']) {
      this.calculateSliderPosition();
      this.stepSize = this.sliderOptions.stepSize || 1;
      this.numberOfVisibleItems = this.sliderOptions.numberOfVisibleItems;
      //this.indicatorsLength = Math.ceil(this.sliderItems.length / this.sliderOptions.numberOfVisibleItems);

      this.maxCurrentIndex = (this.sliderItems.length - 1) - (this.numberOfVisibleItems - this.stepSize)
      const indicatorsNumber = ((this.sliderItems.length - this.sliderOptions.numberOfVisibleItems) / this.stepSize) + 1
      this.indicatorsLength = Math.ceil(indicatorsNumber);
      this.indicatorsArray = Array.from({ length: this.indicatorsLength }, (_, i) => i);
      this.spaceBetween = this.sliderOptions.spaceBetween || 12
      this.isRTL = this.sliderOptions.rtl || false;
      this.animationSpeed = this.sliderOptions.animationSpeed || '0.6s';
      this.animation = this.sliderOptions.animation || 'linear';
      if (this.sliderOptions.autoplay) {
        this.startAutoplay();
      }
    }
    if (changes['responsiveOptions']) {

      this.sortedResponsiveOptons = this.responsiveOptions.sort((a: any, b: any) => parseInt(a.breakpoint.replace('px', ''), 10) - parseInt(b.breakpoint.replace('px', ''), 10));
      this.largestBreakpoint = this.sortedResponsiveOptons.pop();
      console.log(this.sortedResponsiveOptons,'sorted responsive options')

      this.applyResponsiveOptions();
      this.calculateSliderPosition();
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

    console.log(this.translateX, 'translateX');
  }


  nextFunc() {
    const step = this.stepSize;
    const maxIndex = this.sliderItems.length - this.sliderOptions.numberOfVisibleItems;
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
    const maxIndex = this.sliderItems.length - this.sliderOptions.numberOfVisibleItems;
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

  // calculateVisibleItems() {
  //  this.visibleItems = this.sliderItems.slice(this.currentIndex, this.currentIndex + (this.sliderOptions.numberOfVisibleItems));
  //   if (this.sliderOptions.infiniteScroll) {
  //     this.visibleItems = [...this.visibleItems, ...this.sliderItems.slice(0, this.sliderOptions.numberOfVisibleItems)];
  //   }
  // }

  // nextFunc() {
  //   const step = this.stepSize;
  //   if (this.sliderOptions.infiniteScroll) {
  //     this.currentIndex += step;
  //     if (this.currentIndex >= this.sliderItems.length) {
  //       this.currentIndex = 0;
  //     }
  //     this.calculateVisibleItems();
  //   } else {
  //     if (this.currentIndex + this.sliderOptions.numberOfVisibleItems < this.sliderItems.length) {
  //       this.currentIndex += step;
  //       this.calculateVisibleItems();
  //     }
  //   }

  // }

  // prevFunc() {
  //   const step = this.stepSize;
  //   if (this.sliderOptions.infiniteScroll) {
  //     this.currentIndex -= step;
  //     if (this.currentIndex < 0) {
  //       const totalItems = this.sliderItems.length;
  //       this.currentIndex = totalItems - (totalItems % step || step);
  //     }
  //     this.calculateVisibleItems();
  //   } else {
  //     if (this.currentIndex - step >= 0) {
  //       this.currentIndex -= step;
  //       this.calculateVisibleItems();
  //     }
  //   }

  // }

  // slide using indicators
  goToSlide(index: number): void {
    this.currentIndex = index * this.sliderOptions.numberOfVisibleItems;
    this.calculateSliderPosition();
    // const indicatorEl = e.target as HTMLElement
    // indicatorEl.classList.add('.active')
  }

  applyResponsiveOptions(): void {
  if (!this.sortedResponsiveOptons || this.sortedResponsiveOptons.length === 0) {
    return;
  }

  const width = window.innerWidth;
  console.log(this.sortedResponsiveOptons, ' responsive sorted');

  let configFound = false;

  for (let config of this.sortedResponsiveOptons) {
    const breakpoint = parseInt(config.breakpoint.replace('px', ''), 10);
    if (width <= breakpoint) {
      // Apply responsive config
      this.sliderOptions = {
        ...this.sliderOptions,
        numberOfVisibleItems: config.numVisible
      };
      this.numberOfVisibleItems = config.numVisible; // Add this line
      this.stepSize = config.numScroll;
      this.maxCurrentIndex = (this.sliderItems.length - 1) - (config.numVisible - config.numScroll);

      const indicatorsNumber = ((this.sliderItems.length - config.numVisible) / config.numScroll) + 1;
      this.indicatorsLength = Math.ceil(indicatorsNumber);
      this.indicatorsArray = Array.from({ length: this.indicatorsLength }, (_, i) => i);

      configFound = true;
      break;
    }
  }

  // If no matching breakpoint found, use largest breakpoint (desktop default)
  if (!configFound && this.largestBreakpoint) {
    this.sliderOptions = {
      ...this.sliderOptions,
      numberOfVisibleItems: this.largestBreakpoint.numVisible
    };
    this.numberOfVisibleItems = this.largestBreakpoint.numVisible; // Add this line
    this.stepSize = this.largestBreakpoint.numScroll || 1;

    const indicatorsNumber = ((this.sliderItems.length - this.largestBreakpoint.numVisible) / this.stepSize) + 1;
    this.indicatorsLength = Math.ceil(indicatorsNumber);
    this.indicatorsArray = Array.from({ length: this.indicatorsLength }, (_, i) => i);
    this.maxCurrentIndex = (this.sliderItems.length - 1) - (this.largestBreakpoint.numVisible - this.stepSize);
  }

  // Reset current index if it exceeds the new maximum
  if (this.currentIndex > this.maxCurrentIndex) {
    this.currentIndex = 0;
  }

  this.cdr.detectChanges();
}

  // applyResponsiveOptions(): void {
  //   const width = window.innerWidth;
  //   console.log(this.sortedResponsiveOptons, ' responsive sorted')
  //   for (let config of this.sortedResponsiveOptons) {
  //     const breakpoint = parseInt(config.breakpoint.replace('px', ''), 10);
  //     if (width <= breakpoint) {
  //       this.sliderOptions = {
  //         ...this.sliderOptions,
  //         numberOfVisibleItems: config.numVisible
  //       }
  //       this.stepSize = config.numScroll;
  //       this.maxCurrentIndex = (this.sliderItems.length - 1) - (config.numVisible - config.numScroll)

  //       const indicatorsNumber = ((this.sliderItems.length - this.sliderOptions.numberOfVisibleItems) / this.stepSize) + 1
  //       this.indicatorsLength = Math.ceil(indicatorsNumber);

  //       this.indicatorsArray = Array.from({ length: this.indicatorsLength }, (_, i) => i);
  //       break;
  //     } else {
  //       this.sliderOptions = {
  //         ...this.sliderOptions,
  //         numberOfVisibleItems: this.largestBreakpoint?.numVisible
  //       }
  //       this.stepSize = this.largestBreakpoint?.numScroll || 1;
  //       const indicatorsNumber = ((this.sliderItems.length - this.sliderOptions.numberOfVisibleItems) / this.stepSize) + 1
  //       this.indicatorsLength = Math.ceil(indicatorsNumber);
  //       this.indicatorsArray = Array.from({ length: this.indicatorsLength }, (_, i) => i);
  //       this.maxCurrentIndex = (this.sliderItems.length - 1) - (this.numberOfVisibleItems - this.stepSize)

  //     }
  //   }
  //   this.cdr.detectChanges();
  // }

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
