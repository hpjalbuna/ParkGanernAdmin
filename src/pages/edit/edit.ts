import { Component, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { AngularFireDatabase }from 'angularfire2/database';

/**
 * Generated class for the EditPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-edit',
  templateUrl: 'edit.html',
})
export class EditPage {
  inputError = false;
  duplicateCat = false;
  id: number;
  value: string;
  allSpaces = [];

  constructor(private changeDetectorRef: ChangeDetectorRef, public afDatabase: AngularFireDatabase, public viewCtrl: ViewController, public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams) {
  }

  ngAfterViewInit(){
    this.id = this.navParams.get('id')
    this.value = this.navParams.get('value')
    this.changeDetectorRef.detectChanges();
  }

  ionViewDidLoad() {
    
    this.allSpaces = [];
    this.afDatabase.database.ref(`categories/${this.value}`).orderByValue().on('value', spaceSnapshot => {
      var result = spaceSnapshot.val(); 
    
      for(let k in result){  
        if(result[k] === true){
          this.allSpaces.push({ id: k, color: 'default' })
        }else{
          this.allSpaces.push({ id: k, color: 'light' })
        }        
      }    

    });

  }

  alert(category: string, value: string){
    var success = this.alertCtrl.create({
      title: 'Success',
      subTitle: 'Updated category: ' + value + ' to ' + category,
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

  checkIfExists(categoryName: string, value: string){
    
    
  }

  updateCategory(categoryName: string, value: string){   
    // this.afDatabase.database.ref(`categories`).child(this.value).set(categoryName)
    this.afDatabase.database.ref(`list/${this.id}`).set(categoryName);
    this.allSpaces.forEach(space => {
      if(space.color === 'default'){
        this.afDatabase.database.ref(`categories/${categoryName}/${space.id}`).set(true)
      }else {
        this.afDatabase.database.ref(`categories/${categoryName}/${space.id}`).set(false)
      }      
    });

    this.afDatabase.database.ref(`categories/${this.value}`).remove()
    this.alert(categoryName, value);
    this.viewCtrl.dismiss();
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
    if(categoryName.length > 0 && categories.includes(categoryName) && categoryName !== this.value){
      this.duplicateCat = true;
    }else{
      this.duplicateCat = false;
    }
  }
}
