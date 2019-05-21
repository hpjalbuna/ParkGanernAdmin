import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { OccupiedPage } from '../pages/occupied/occupied';
import { ReservedPage } from '../pages/reserved/reserved';
import { CategoryPage } from '../pages/category/category';
import { PreferencesPage} from '../pages/preferences/preferences';
import { RevenuePage } from '../pages/revenue/revenue';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = RevenuePage;

  pages: Array<{title: string, component: any}>;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'View revenue', component: RevenuePage},
      { title: 'View occupied spaces', component: OccupiedPage},
      { title: 'View reserved spaces', component: ReservedPage},
      { title: 'Manage categories', component: CategoryPage },
      { title: 'Edit preferences', component: PreferencesPage}   

    ];

  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }
}
