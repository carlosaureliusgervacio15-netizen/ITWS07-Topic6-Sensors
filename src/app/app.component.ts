import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonApp, IonButton, IonContent, IonHeader, IonMenu, IonMenuToggle, IonRouterOutlet, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, IonMenu, RouterModule, IonButton, IonContent, IonMenuToggle, IonHeader, IonToolbar, IonTitle],
})
export class AppComponent {
  constructor() {}
}
