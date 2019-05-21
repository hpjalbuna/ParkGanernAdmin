import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RevenuePage } from './revenue';

@NgModule({
  declarations: [
    RevenuePage,
  ],
  imports: [
    IonicPageModule.forChild(RevenuePage),
  ],
})
export class RevenuePageModule {}
