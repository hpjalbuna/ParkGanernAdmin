import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MisparkPage } from './mispark';

@NgModule({
  declarations: [
    MisparkPage,
  ],
  imports: [
    IonicPageModule.forChild(MisparkPage),
  ],
  exports: [
    MisparkPage
  ]
})
export class MisparkPageModule {}
