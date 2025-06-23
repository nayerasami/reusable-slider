import { Component, TemplateRef, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SliderComponent } from './components/slider/slider.component';
import { ResponsiveConfig, SliderOptions } from './components/slider/interfaces/sliderTypes';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet ,SliderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'reusable-slider';
   @ViewChild('sliderEl') sliderEl !:HTMLElement;
  @ViewChild('customIndicatorTemplate') customIndicatorTemplate!: TemplateRef<any>;

  ngAfterViewInit():void{
    // this.sliderOptions ={
    //   ...this.sliderOptions ,
    //   customIndicators: this.customIndicatorTemplate
    // }
  }
  responsiveOptions: ResponsiveConfig[] = [
    {
      breakpoint: '1400px',
      numVisible: 1,
      numScroll: 1
    },
    {
      breakpoint: '1199px',
      numVisible: 1,
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
    // isDraggable: false,
    numberOfVisibleItems: 1,
    stepSize:1,
    //spaceBetween:50,
    // rtl: true,
    animation: 'ease-in-out',
    animationSpeed: '0.8s',
    rows: 1,
    vertical:true,
    gallaryImages:[
      'https://th.bing.com/th/id/OIP.EfEw_NSiPbpZgSM0vL-OUAHaGl?w=540&h=480&rs=1&pid=ImgDetMain&cb=idpwebp2&o=7&rm=3',
      'https://wallpaperaccess.com/full/6265165.jpg',
      'https://th.bing.com/th/id/OIP.0_yGb353J_SPSma7_uTmzQHaEK?rs=1&pid=ImgDetMain&cb=idpwebp2&o=7&rm=3',
      'https://th.bing.com/th/id/R.d7faa569113256b2a90f51f9b80bc0c3?rik=IbuyyYfJZ%2fZTyA&riu=http%3a%2f%2f2.bp.blogspot.com%2f-OwWMk1CC2ok%2fUM2hsDN-nSI%2fAAAAAAAAEjQ%2fFp3dKry-lFU%2fs1600%2flatest%2blandscapes%2bhd%2bwallpapers.jpg&ehk=sGgoYBYOtEV3wveQ7wr0wqv6aNdBKcTahcVD6alzIZU%3d&risl=&pid=ImgRaw&r=0',
      'https://wallpaperaccess.com/full/6265165.jpg',
      'https://th.bing.com/th/id/OIP.0_yGb353J_SPSma7_uTmzQHaEK?rs=1&pid=ImgDetMain&cb=idpwebp2&o=7&rm=3',
      'https://th.bing.com/th/id/R.d7faa569113256b2a90f51f9b80bc0c3?rik=IbuyyYfJZ%2fZTyA&riu=http%3a%2f%2f2.bp.blogspot.com%2f-OwWMk1CC2ok%2fUM2hsDN-nSI%2fAAAAAAAAEjQ%2fFp3dKry-lFU%2fs1600%2flatest%2blandscapes%2bhd%2bwallpapers.jpg&ehk=sGgoYBYOtEV3wveQ7wr0wqv6aNdBKcTahcVD6alzIZU%3d&risl=&pid=ImgRaw&r=0'
       ]
    // nextButton:'<div class="next">next</div>',
    // prevButton:'<div class="next">pre</div>'
  }

  sliderItems =[
      'https://th.bing.com/th/id/OIP.EfEw_NSiPbpZgSM0vL-OUAHaGl?w=540&h=480&rs=1&pid=ImgDetMain&cb=idpwebp2&o=7&rm=3',
      'https://wallpaperaccess.com/full/6265165.jpg',
      'https://th.bing.com/th/id/OIP.0_yGb353J_SPSma7_uTmzQHaEK?rs=1&pid=ImgDetMain&cb=idpwebp2&o=7&rm=3',
      'https://th.bing.com/th/id/R.d7faa569113256b2a90f51f9b80bc0c3?rik=IbuyyYfJZ%2fZTyA&riu=http%3a%2f%2f2.bp.blogspot.com%2f-OwWMk1CC2ok%2fUM2hsDN-nSI%2fAAAAAAAAEjQ%2fFp3dKry-lFU%2fs1600%2flatest%2blandscapes%2bhd%2bwallpapers.jpg&ehk=sGgoYBYOtEV3wveQ7wr0wqv6aNdBKcTahcVD6alzIZU%3d&risl=&pid=ImgRaw&r=0',
      'https://wallpaperaccess.com/full/6265165.jpg',
      'https://th.bing.com/th/id/OIP.0_yGb353J_SPSma7_uTmzQHaEK?rs=1&pid=ImgDetMain&cb=idpwebp2&o=7&rm=3',
      'https://th.bing.com/th/id/R.d7faa569113256b2a90f51f9b80bc0c3?rik=IbuyyYfJZ%2fZTyA&riu=http%3a%2f%2f2.bp.blogspot.com%2f-OwWMk1CC2ok%2fUM2hsDN-nSI%2fAAAAAAAAEjQ%2fFp3dKry-lFU%2fs1600%2flatest%2blandscapes%2bhd%2bwallpapers.jpg&ehk=sGgoYBYOtEV3wveQ7wr0wqv6aNdBKcTahcVD6alzIZU%3d&risl=&pid=ImgRaw&r=0'
       
    // { id: 1, name: 'slide 1' },
    // { id: 2, name: 'slide 2' },
    // { id: 3, name: 'slide 3' },
    // { id: 4, name: 'slide 4' },
    // { id: 5, name: 'slide 5' },
    // { id: 6, name: 'slide 6' },
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
