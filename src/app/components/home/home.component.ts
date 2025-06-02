import { ResponsiveConfig, SliderOptions } from './../slider/interfaces/sliderTypes';
import { Component } from '@angular/core';
import { SliderComponent } from '../slider/slider.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [SliderComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  responsiveOptions: ResponsiveConfig[] = [
    {
      breakpoint: '1400px',
      numVisible: 4,
      numScroll:1
    },
    {
      breakpoint: '1199px',
      numVisible: 3,
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

  sliderOptions: SliderOptions = {
    navButtons: true,
    autoplay: false,
    autoplaySpeed: 3000,
    indicators: true,
    infiniteScroll: true,
    isDraggable: false,
    numberOfVisibleItems: 3,
    stepSize: 1,
    //spaceBetween:50,
    rtl: false,
    animation: 'ease-in-out',
    animationSpeed: '0.8s',
    rows:1
    // nextButton:'<div class="next">next</div>',
    // prevButton:'<div class="next">pre</div>'
  }

  sliderItems = [
    { id: 1, name: 'slide 1' },
    { id: 2, name: 'slide 2' },
    { id: 3, name: 'slide 3' },
    { id: 4, name: 'slide 4' },
    { id: 5, name: 'slide 5' },
    { id: 6, name: 'slide 6' },
    // { id: 7, name: 'slide 7' },
    // { id: 8, name: 'slide 8' },
    // { id: 9, name: 'slide 9' },
    // { id: 10, name: 'slide 10' },
    // { id: 11, name: 'slide 11' },
    // { id: 12, name: 'slide 12' },
    // { id: 13, name: 'slide 13' },
    // { id: 14, name: 'slide 14' },
    // { id: 15, name: 'slide 15' },
  ]


}
