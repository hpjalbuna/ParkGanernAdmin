import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'; 
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { OccupiedPage } from '../pages/occupied/occupied';
import { ReservedPage } from '../pages/reserved/reserved';
import { CategoryPage } from '../pages/category/category';
import { SpacePage } from '../pages/space/space';
import { PreferencesPage } from '../pages/preferences/preferences';
import { RevenuePage } from '../pages/revenue/revenue';
import { ModalPage } from '../pages/modal/modal'

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireModule } from 'angularfire2';
import { FIREBASE_CONFIG } from './app.firebase.config';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ListPage,
    OccupiedPage,
    ReservedPage,
    CategoryPage,
    SpacePage,
    PreferencesPage,
    RevenuePage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(FIREBASE_CONFIG),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    HttpClientModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ListPage,
    OccupiedPage,
    ReservedPage,
    CategoryPage, 
    SpacePage, 
    PreferencesPage,
    RevenuePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    AngularFirestore,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
