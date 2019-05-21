import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams } from 'ionic-angular';

/**
 * Generated class for the MisparkPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-mispark',
  templateUrl: 'mispark.html',
})
export class MisparkPage {
  wrongParking = []
  filteredList = []
  shownGroup = null
  constructor(public viewCtrl: ViewController, public navCtrl: NavController, public navParams: NavParams) {
    this.wrongParking = navParams.get('wrongParking')
  }

  ionViewDidLoad() {
    
    this.filteredList = this.wrongParking
    console.log(this.filteredList)
  }

  closeModal(){
    this.viewCtrl.dismiss()
  }

  onChange(value){
  
    if(value === "all"){
      console.log('all')
      this.filteredList = this.wrongParking
    }else{
      this.filteredList = [this.wrongParking.find(
      item => item.space === value)]
    }

    console.log(this.filteredList)
  }

}
