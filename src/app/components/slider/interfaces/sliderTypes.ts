export interface ResponsiveConfig {
  breakpoint: string;
  numVisible: number;
  numScroll: number;
}


export interface SliderItems {

}
export interface SliderOptions {
  navButtons: boolean;
  autoScroll: boolean;
  indicators: boolean;
  infiniteScroll: boolean;
  isDraggable:boolean;
  stepSize:number;
  numberOfVisibleItems:number;
  sliderItems: any[];
}
