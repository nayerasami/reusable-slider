export interface ResponsiveConfig {
  breakpoint: string;
  numVisible: number;
  numScroll: number;
}



export interface SliderOptions {
  navButtons?: boolean;
  autoplay?: boolean;
  autoplaySpeed?:number;
  indicators?: boolean;
  infiniteScroll?: boolean;
  isDraggable?:boolean;
  stepSize?:number;
  numberOfVisibleItems:number;

}
