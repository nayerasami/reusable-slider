import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { ResponsiveConfig, SliderOptions } from './interfaces/sliderTypes';

@Component({
  selector: 'app-slider',
  imports: [CommonModule],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.css'
})
export class SliderComponent implements OnInit {
  constructor(private cdr: ChangeDetectorRef) { }
  @ViewChild('sliderWrapper', { static: true }) sliderMain!: ElementRef;
  @Input() responsiveOptions: ResponsiveConfig[] = [
    {
      breakpoint: '1400px',
      numVisible: 4,
      numScroll: 1
    },
    {
      breakpoint: '1199px',
      numVisible: 4,
      numScroll: 1
    },
    {
      breakpoint: '767px',
      numVisible: 2,
      numScroll: 1
    },
    {
      breakpoint: '575px',
      numVisible: 1,
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
    sliderItems: [
      { id: 1, name: 'item1' },
      { id: 2, name: 'item2' },
      { id: 3, name: 'item3' },
      { id: 4, name: 'item4' },
      { id: 5, name: 'item5' },
      { id: 6, name: 'item6' },
      // { id: 7, name: 'item7' },
      // { id: 8, name: 'item8' },
    ]
  }


  isDragging: boolean = false;
  startX = 0;
  scrollStart = 0;
  visibleItems: any[] = [];
  currentIndex = 0;
  stepSize: number = this.sliderOptions.stepSize;
 // indicatorsLength: number = Math.ceil(this.sliderOptions.sliderItems.length / this.sliderOptions.numberOfVisibleItems)
  indicatorsLength: number = Math.ceil(this.sliderOptions.sliderItems.length/this.stepSize);
  autoplayInterval: any;
  resizeTimeout: any;
  get indicatorsArray(): number[] {
    return Array.from({ length: this.indicatorsLength }, (_, i) => i);
  }

  // items = [
  //   { id: 1, name: 'item1' },
  //   { id: 2, name: 'item2' },
  //   { id: 3, name: 'item3' },
  //   { id: 4, name: 'item4' },
  //   { id: 5, name: 'item5' },
  //   { id: 6, name: 'item6' },
  //   { id: 7, name: 'item7' },
  //   { id: 8, name: 'item8' }
  // ]

  ngOnInit(): void {
    this.calculateVisibleItems()
    window.addEventListener('resize', this.onWindowResize.bind(this));
    if (this.sliderOptions.autoplay) {
      this.startAutoplay();
    }
  }

  onWindowResize = () => {
    // this.applyResponsiveOptions();
    // this.calculateVisibleItems();
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.applyResponsiveOptions();
      this.calculateVisibleItems();
      this.cdr.detectChanges();
    }, 0);
  }

  calculateVisibleItems() {
    this.visibleItems = this.sliderOptions.sliderItems.slice(this.currentIndex, this.currentIndex + this.sliderOptions.numberOfVisibleItems);
    if(this.sliderOptions.infiniteScroll){
      this.visibleItems = [...this.visibleItems, ...this.sliderOptions.sliderItems.slice(0, this.sliderOptions.numberOfVisibleItems)];
    }
  }

  nextFunc() {
    const step = this.stepSize;
    if (this.sliderOptions.infiniteScroll) {
      this.currentIndex += step;
      if (this.currentIndex >= this.sliderOptions.sliderItems.length) {
        this.currentIndex = 0;
      }
      this.calculateVisibleItems();
    } else {
      if (this.currentIndex + this.sliderOptions.numberOfVisibleItems < this.sliderOptions.sliderItems.length) {
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
        const totalItems = this.sliderOptions.sliderItems.length;
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
    console.log(index)
    this.currentIndex = index * this.sliderOptions.numberOfVisibleItems;
    this.calculateVisibleItems();
  }

  applyResponsiveOptions(): void {
    const width = window.innerWidth;
    for (let config of this.responsiveOptions) {
      const breakpoint = parseInt(config.breakpoint.replace('px', ''), 10);
      if (width <= breakpoint) {
        this.sliderOptions.numberOfVisibleItems = config.numVisible;
        this.stepSize = config.numScroll;
        break;
      }
    }
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
