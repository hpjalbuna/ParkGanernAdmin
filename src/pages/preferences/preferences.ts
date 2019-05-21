import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { AngularFireDatabase }from 'angularfire2/database';
import { Preference } from '../../models/preference';
import * as moment from 'moment';
/**
 * Generated class for the PreferencesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-preferences',
  templateUrl: 'preferences.html',
})
export class PreferencesPage {
  preference = {} as Preference;
  inputError = false;
  constructor(private alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, private afDatabase: AngularFireDatabase) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PreferencesPage');
  }

  ionViewWillLoad() {
    this.afDatabase.database.ref(`/preferences/`).orderByValue().on('value', prefSnapshot => {
      this.preference = prefSnapshot.val();
      this.preference.minTime = moment(this.preference.minTime, "HH:mm").format("hh:mm A")
      this.preference.maxTime = moment(this.preference.maxTime, "HH:mm").format("hh:mm A")
    });
    
  }



  alert(message: string){
    const alert = this.alertCtrl.create({
      title: 'Success',
      message: message,
      buttons: [
        {
          text: 'Ok'       
        }
      ]
    });
    alert.present();

  }

  errorAlert(message: string){
    const alert = this.alertCtrl.create({
      title: 'Update failed',
      message: message,
      buttons: [
        {
          text: 'Ok'       
        }
      ]
    });
    alert.present();

  }

  setTime(minTime: string, maxTime: string, amount: Number, rate: Number){
    if(this.inputError){
      this.errorAlert("Amount must be greater than 0.");
      return;
    }

    if(minTime !== undefined && maxTime !== undefined && rate !== undefined && amount !== undefined){
      if(moment(maxTime, 'HH:mm').isAfter(moment(minTime, 'HH:mm'))){
        this.afDatabase.database.ref(`/preferences/minTime`).set(minTime);
        this.afDatabase.database.ref(`/preferences/maxTime`).set(maxTime);
        this.afDatabase.database.ref(`/preferences/amount`).set(amount);
        this.afDatabase.database.ref(`/preferences/rate`).set(rate);
        this.alert("Your preferences have been updated.")
        return;
      }else{
        this.errorAlert("Opening time must not be later than closing time.")
        return;
      }    
    }

    if(minTime !== undefined && maxTime !== undefined){
      if(moment(maxTime, 'HH:mm').isAfter(moment(minTime, 'HH:mm'))){
        this.afDatabase.database.ref(`/preferences/minTime`).set(minTime);
        this.afDatabase.database.ref(`/preferences/maxTime`).set(maxTime);
        this.alert("Successfully updated operating hours.")
      }else{
        this.errorAlert("Opening time must not be later than closing time.")
        return;
      }      
    }else if(minTime === undefined && maxTime === undefined){
      this.errorAlert("Please complete the form")
      return;
    }

    if(rate !== undefined && amount !== undefined){
      this.afDatabase.database.ref(`/preferences/amount`).set(amount);
      this.afDatabase.database.ref(`/preferences/rate`).set(rate);
      this.alert("Successfully updated rate.")
      return;
    }else{
      this.errorAlert("Please complete the form.")
      return;
    }
   
  }
  
  checkInput(amount: string){
    console.log("checking...")
    if(parseInt(amount) <= 0){
      this.inputError = true;
    }else{
      this.inputError = false;
    }
  }

}
