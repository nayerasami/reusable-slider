import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HearderComponent } from "./components/hearder/hearder.component";
import { DemosComponent } from "./components/demos/demos.component";
import { SettingsComponent } from "./components/settings/settings.component";
import { UsageComponent } from "./components/usage/usage.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HearderComponent, DemosComponent, SettingsComponent, UsageComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'reusable-slider';
}
