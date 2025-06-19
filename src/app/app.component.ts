import { AfterViewInit, Component } from '@angular/core';
import { ActivatedRoute, Route, RouterOutlet } from '@angular/router';
import { HearderComponent } from "./components/hearder/hearder.component";
import { DemosComponent } from "./components/demos/demos.component";
import { SettingsComponent } from "./components/settings/settings.component";
import { UsageComponent } from "./components/usage/usage.component";
import { CommonModule, Location } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HearderComponent, DemosComponent, SettingsComponent, UsageComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  title = 'reusable-slider';
  constructor(public route: ActivatedRoute, private location: Location) { }

  ngAfterViewInit(): void {
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        const element = document.getElementById(fragment);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        this.location.replaceState('/');
        const element = document.getElementById('banner-section');
        element?.scrollIntoView({ behavior: 'smooth' });
      }
    })
  }


}
