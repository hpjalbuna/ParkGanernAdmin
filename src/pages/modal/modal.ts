import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { AngularFireDatabase }from 'angularfire2/database';

/**
 * Generated class for the ModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-modal',
  templateUrl: 'modal.html',
})
export class ModalPage {
  duplicateCat = false;
  inputError = false;
  allSpaces = [];
  chipColor = 'light';
  activeIndex: any;
  categoryName: string;
  constructor(private alertCtrl: AlertController, private afDatabase: AngularFireDatabase, public navCtrl: NavController, public viewCtrl: ViewController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    this.allSpaces = [];
    this.afDatabase.database.ref(`spaces`).orderByValue().on('value', spaceSnapshot => {
      var result = spaceSnapshot.val(); 
    
      for(let k in result){  
        this.allSpaces.push({ id: k, color: 'light' })
      }    

    });

    console.log(this.allSpaces)
  }

  alert(category: string){
    var success = this.alertCtrl.create({
      title: 'Success',
      subTitle: 'Created new category: ' + category,
      buttons: ['OK']
    });
    success.present();
  }

  errorAlert(message: string){
    var success = this.alertCtrl.create({
      title: 'Failed to add new Category',
      subTitle: message,
      buttons: ['OK']
    });
    success.present();
  }

  closeModal(){
    this.viewCtrl.dismiss()
  }

  toggleColor(space: any, i: number) {
    console.log(event)
    if(space.color === 'light'){
      space.color = 'default'
    }else {
      space.color = 'light'
    }
  }
  
  checkIfExists(categoryName: string){
    var categories = []
    this.afDatabase.database.ref(`list`).orderByValue().once('value', spaceSnapshot => {
      var data = spaceSnapshot.val()
      categories = Object.keys(data).map(key => data[key])
    });
    console.log(categories)
    console.log(categoryName)
    if(categories.includes(categoryName)){
      console.log('skdjaskd')
      var error = this.alertCtrl.create({
        title:'Error',
        subTitle: categoryName + ' already exists.',
        buttons: ['OK']
      });
      error.present();      
    }else{
      this.addCategory(categoryName);
    }
    
  }

  addCategory(categoryName: string){   
    var hasSelected = this.allSpaces.some(({color}) => color.includes('default'))
    if(!hasSelected){
      this.errorAlert("You must add spaces under this category.")
      return;
    }else if(this.inputError){
      this.errorAlert("Numbers and symbols are not allowed.")
      return;
    }else if(this.duplicateCat){
      this.errorAlert("Category already exists.")
      return;
    }else{
      this.afDatabase.database.ref(`list`).push(categoryName);
      this.allSpaces.forEach(space => {
        if(space.color === 'default'){
          this.afDatabase.database.ref(`categories/${categoryName}/${space.id}`).set(true)
        }else {
          this.afDatabase.database.ref(`categories/${categoryName}/${space.id}`).set(false)
        }      
      });
      this.alert(categoryName);
      this.viewCtrl.dismiss();
    }
  }

  validateInput(categoryName: string){
    var pattern = /^[a-zA-Z]+$/
    if(!pattern.test(categoryName) && categoryName.length > 0){
      this.inputError = true; 
    }else{
      this.inputError = false;
    }
    var categories = []
    this.afDatabase.database.ref(`list`).orderByValue().once('value', spaceSnapshot => {
      var data = spaceSnapshot.val()
      categories = Object.keys(data).map(key => data[key])
    });
    if(categoryName.length > 0 && categories.includes(categoryName)){
      this.duplicateCat = true;
    }else{
      this.duplicateCat = false;
    }
  }

}
