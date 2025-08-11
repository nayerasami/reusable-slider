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
      numVisible: 1,
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
  // infiniteScroll: true,
    // isDraggable: false,
    numberOfVisibleItems: 1,
    stepSize:1,
    spaceBetween:30,
    // rtl: true,
    animation: 'ease-in-out',
    animationSpeed: '0.8s',
    rows: 1,
    height: '510px',
    vertical: true,
    gallaryImages:[
      'https://doodleipsum.com/3000x2000/flat?bg=D98D63&i=4f0a73f37c3672bcf5c214b62b690ba4',
      'https://doodleipsum.com/3000x2000/flat?bg=825DEB&i=ab89dafe8593452edb4829000c2a2434',
      'https://doodleipsum.com/3000x2000/outline?bg=D96363&i=fcb5bd61f88331a7ada8b0de52dbc714',
      'https://doodleipsum.com/3000x2000?bg=6392D9&i=89a1695c883cfff8c9a7505eef663f80',
      'https://doodleipsum.com/3000x2000/flat?bg=D98D63&i=4f0a73f37c3672bcf5c214b62b690ba4',
      'https://doodleipsum.com/3000x2000/flat?bg=825DEB&i=ab89dafe8593452edb4829000c2a2434',
      'https://doodleipsum.com/3000x2000/outline?bg=D96363&i=fcb5bd61f88331a7ada8b0de52dbc714',
      'https://doodleipsum.com/3000x2000?bg=6392D9&i=89a1695c883cfff8c9a7505eef663f80'
    ]
    //    ]
    // nextButton:'<div class="next">next</div>',
    // prevButton:'<div class="next">pre</div>'
  }

  sliderItems =[
    'https://doodleipsum.com/3000x2000/flat?bg=D98D63&i=4f0a73f37c3672bcf5c214b62b690ba4',
    'https://doodleipsum.com/3000x2000/flat?bg=825DEB&i=ab89dafe8593452edb4829000c2a2434',
    'https://doodleipsum.com/3000x2000/outline?bg=D96363&i=fcb5bd61f88331a7ada8b0de52dbc714',
    'https://doodleipsum.com/3000x2000?bg=6392D9&i=89a1695c883cfff8c9a7505eef663f80',
    'https://doodleipsum.com/3000x2000/flat?bg=D98D63&i=4f0a73f37c3672bcf5c214b62b690ba4',
    'https://doodleipsum.com/3000x2000/flat?bg=825DEB&i=ab89dafe8593452edb4829000c2a2434',
    'https://doodleipsum.com/3000x2000/outline?bg=D96363&i=fcb5bd61f88331a7ada8b0de52dbc714',
    'https://doodleipsum.com/3000x2000?bg=6392D9&i=89a1695c883cfff8c9a7505eef663f80'

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
