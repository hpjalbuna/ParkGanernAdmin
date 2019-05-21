import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OccupiedPage } from './occupied';

@NgModule({
  declarations: [
    OccupiedPage,
  ],
  imports: [
    IonicPageModule.forChild(OccupiedPage),
  ],
})
export class OccupiedPageModule {}
