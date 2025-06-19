import { Component } from '@angular/core';
import { ResponsiveConfig, SliderOptions } from './../slider/interfaces/sliderTypes';
import { SliderComponent } from '../slider/slider.component';
import { CommonModule } from '@angular/common';
import { HearderComponent } from "../hearder/hearder.component";
@Component({
  selector: 'app-demos',
  imports: [SliderComponent],
  templateUrl: './demos.component.html',
  styleUrl: './demos.component.scss'
})
export class DemosComponent {
  responsiveOptions: ResponsiveConfig[] = [
    { breakpoint: '1400px', numVisible: 3, numScroll: 2 },
    { breakpoint: '1199px', numVisible: 3, numScroll: 1 },
    { breakpoint: '767px', numVisible: 2, numScroll: 1 },
    { breakpoint: '575px', numVisible: 1, numScroll: 1 }
  ];

  singleItemSliderOptions: SliderOptions = {
    navButtons: true,
    autoplay: false,
    autoplaySpeed: 3000,
    indicators: true,
    //infiniteScroll: true,
    // isDraggable: false,
    // numberOfVisibleItems: 3,
    //stepSize: 4,
    //spaceBetween:50,
    // rtl: true,
    animation: 'ease-in-out',
    animationSpeed: '0.8s',
    //rows: 1
    // nextButton:'<div class="next">next</div>',
    // prevButton:'<div class="next">pre</div>'
  };

  singleItemSliderItems = [
    { id: 1, name: 'slide 1' },
    { id: 2, name: 'slide 2' },
    { id: 3, name: 'slide 3' },
    { id: 4, name: 'slide 4' },
    { id: 5, name: 'slide 5' },
    { id: 6, name: 'slide 6' },
  ];

  multipleItemsSliderItems = [
    { id: 1, name: 'slide 1' },
    { id: 2, name: 'slide 2' },
    { id: 3, name: 'slide 3' },
    { id: 4, name: 'slide 4' },
    { id: 5, name: 'slide 5' },
    { id: 6, name: 'slide 6' },
    { id: 7, name: 'slide 7' },
    { id: 8, name: 'slide 8' },
    { id: 9, name: 'slide 9' },
    { id: 10, name: 'slide 10' },
    { id: 11, name: 'slide 11' },
    { id: 12, name: 'slide 12' }
  ];

  multipleItemSliderOptions: SliderOptions = {
    navButtons: true,
    autoplay: false,
    autoplaySpeed: 3000,
    indicators: true,
    //infiniteScroll: true,
    // isDraggable: false,
    numberOfVisibleItems: 3,
    stepSize: 2,
    //spaceBetween:50,
    // rtl: true,
    animation: 'ease-in-out',
    animationSpeed: '0.8s',
    //rows: 1
    // nextButton:'<div class="next">next</div>',
    // prevButton:'<div class="next">pre</div>'
  };

  responsiveDisplaySliderOptions: SliderOptions = {
    navButtons: true,
    autoplay: false,
    autoplaySpeed: 3000,
    indicators: true,
    //infiniteScroll: true,
    // isDraggable: false,
    numberOfVisibleItems: 4,
    stepSize: 3,
    //spaceBetween:50,
    // rtl: true,
    animation: 'ease-in-out',
    animationSpeed: '0.8s',
    //rows: 1
    // nextButton:'<div class="next">next</div>',
    // prevButton:'<div class="next">pre</div>'
  };

  responsiveDisplaySliderItems = [
    { id: 1, name: 'slide 1' },
    { id: 2, name: 'slide 2' },
    { id: 3, name: 'slide 3' },
    { id: 4, name: 'slide 4' },
    { id: 5, name: 'slide 5' },
    { id: 6, name: 'slide 6' },
    { id: 7, name: 'slide 7' },
    { id: 8, name: 'slide 8' },
    { id: 9, name: 'slide 9' },
    { id: 10, name: 'slide 10' },
    { id: 11, name: 'slide 11' },
    { id: 12, name: 'slide 12' },
  ];

  autoplaySliderItems = [
    { id: 1, name: 'slide 1' },
    { id: 2, name: 'slide 2' },
    { id: 3, name: 'slide 3' },
    { id: 4, name: 'slide 4' },
    { id: 5, name: 'slide 5' },
    { id: 6, name: 'slide 6' },
    { id: 7, name: 'slide 7' },
    { id: 8, name: 'slide 8' },
    { id: 9, name: 'slide 9' },
    { id: 10, name: 'slide 10' },
    { id: 11, name: 'slide 11' },
    { id: 12, name: 'slide 12' },
  ];

  autoplaySliderOptions: SliderOptions = {
    autoplay: true,
    autoplaySpeed: 3000,
    indicators: true,
    //infiniteScroll: true,
    // isDraggable: false,
    numberOfVisibleItems: 4,
    stepSize: 3,
    //spaceBetween:50,
    // rtl: true,
    animation: 'ease-in-out',
    animationSpeed: '0.8s',
    //rows: 1
    // nextButton:'<div class="next">next</div>',
    // prevButton:'<div class="next">pre</div>'
  };

  infiniteScrollSliderItems = [
    { id: 1, name: 'slide 1' },
    { id: 2, name: 'slide 2' },
    { id: 3, name: 'slide 3' },
    { id: 4, name: 'slide 4' },
    { id: 5, name: 'slide 5' },
    { id: 6, name: 'slide 6' },

  ];

  infiniteScrollSliderOptions: SliderOptions = {
    navButtons: true,
    autoplay: false,
    autoplaySpeed: 3000,
    indicators: true,
    infiniteScroll: true,
    numberOfVisibleItems: 4,
    stepSize: 3,
    //spaceBetween:50,
    // rtl: true,
    animation: 'ease-in-out',
    animationSpeed: '0.8s',
    //rows: 1
    // nextButton:'<div class="next">next</div>',
    // prevButton:'<div class="next">pre</div>'
  };

  multipleRowsSliderItems = [
    { id: 1, name: 'slide 1' },
    { id: 2, name: 'slide 2' },
    { id: 3, name: 'slide 3' },
    { id: 4, name: 'slide 4' },
    { id: 5, name: 'slide 5' },
    { id: 6, name: 'slide 6' },
    { id: 7, name: 'slide 7' },
    { id: 8, name: 'slide 8' },
    { id: 9, name: 'slide 9' },
    { id: 10, name: 'slide 10' },
    { id: 11, name: 'slide 11' },
    { id: 12, name: 'slide 12' },
    { id: 13, name: 'slide 13' },
    { id: 14, name: 'slide 14' },
    { id: 15, name: 'slide 15' },
  //  { id: 16, name: 'slide 16' },
  ];

  multipleRowsSliderOptions: SliderOptions = {
    navButtons: true,
    autoplay: false,
    autoplaySpeed: 3000,
    indicators: true,
    infiniteScroll: true,
    // isDraggable: false,
    numberOfVisibleItems: 3,
    stepSize: 2,
    //spaceBetween:50,
    // rtl: true,
    animation: 'ease-in-out',
    animationSpeed: '0.8s',
    rows: 2
    // nextButton:'<div class="next">next</div>',
    // prevButton:'<div class="next">pre</div>'
  };

  RTLSliderItems = [
    { id: 1, name: 'slide 1' },
    { id: 2, name: 'slide 2' },
    { id: 3, name: 'slide 3' },
    { id: 4, name: 'slide 4' },
    { id: 5, name: 'slide 5' },
    { id: 6, name: 'slide 6' },

  ];

  RTLSliderOptions: SliderOptions = {
    navButtons: true,
    autoplay: false,
    autoplaySpeed: 3000,
    indicators: true,
    //infiniteScroll: true,
    // isDraggable: false,
    numberOfVisibleItems: 2,
    stepSize: 1,
    //spaceBetween:50,
    rtl: true,
    animation: 'ease-in-out',
    animationSpeed: '0.8s',
    //rows: 1
    // nextButton:'<div class="next">next</div>',
    // prevButton:'<div class="next">pre</div>'
  };

  customNavButtonsSliderItems = [
    { id: 1, name: 'slide 1' },
    { id: 2, name: 'slide 2' },
    { id: 3, name: 'slide 3' },
    { id: 4, name: 'slide 4' },
    { id: 5, name: 'slide 5' },
    { id: 6, name: 'slide 6' },
    { id: 7, name: 'slide 7' },
    { id: 8, name: 'slide 8' },
    { id: 9, name: 'slide 9' },
  ];

  customNavButtonsSliderOptions = {
    navButtons: true,
    autoplay: false,
    autoplaySpeed: 3000,
    indicators: true,
    numberOfVisibleItems: 3,
    stepSize: 1,
    nextButton: '<img src="/assets/images/icons/arrow-left.svg" width="25" height="24" alt="Icon" class="filter-white img-flip" />',
    prevButton: '<img src="/assets/images/icons/arrow-right.svg" width="25" height="24"  alt="Icon" class="filter-white img-flip" />'
  };
}
