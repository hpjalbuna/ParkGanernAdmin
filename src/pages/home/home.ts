import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AngularFireDatabase }from 'angularfire2/database';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController, public afDatabase: AngularFireDatabase) {
 
  }
 
  ionViewDidLoad() {
    var occupiedSpaces = [];
    this.afDatabase.database.ref(`occupied`).orderByValue().on('value', spaceSnapshot => {
      spaceSnapshot.forEach(spaceData => {
        console.log(spaceData.val())
        occupiedSpaces.push(spaceData.val())
      });
      console.log(occupiedSpaces)
    });
  }
  ionViewDidEnter() {  }

 
}
