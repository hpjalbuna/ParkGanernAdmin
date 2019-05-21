import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ModalController } from 'ionic-angular';
import { AngularFireDatabase }from 'angularfire2/database';
import { Category } from '../../models/category';
import { ModalPage } from '../modal/modal';
import { EditPage } from '../edit/edit';

/**
 * Generated class for the CategoryPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-category',
  templateUrl: 'category.html',
})
export class CategoryPage {
  public hideDiv: Boolean = true;
  public categories = [];
  public category: Category;

  constructor(public modalCtrl: ModalController, private afDatabase: AngularFireDatabase, public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CategoryPage');
  }

  ionViewWillLoad(){     
    this.loadCategories()
  }

  loadCategories(){
    this.categories = [];
    this.afDatabase.database.ref(`/list`).on('value', itemSnapshot => {
      itemSnapshot.forEach( itemSnap => {
        this.categories.push({ id: itemSnap.key, value: itemSnap.val()});
      });
    });
  }

  openModal() {
    var modalPage = this.modalCtrl.create('ModalPage')
    modalPage.present();
    modalPage.onDidDismiss(() => {
      this.loadCategories()
    })
      
  }

  editModal(id: string, value: string){
    var modalPage = this.modalCtrl.create('EditPage', { id: id, value: value})
    modalPage.present();
    modalPage.onDidDismiss(() => {
      this.loadCategories()
    })
  }

  newCategory(){
    const prompt = this.alertCtrl.create({
      title: 'New Category',
      inputs: [
          {
          name: 'category',
          placeholder: 'Input Name'
          },
      ],
      buttons: [
          {
          text: 'Cancel',
          handler: data => {
              console.log('Cancel clicked');
              }
          },
          {
          text: 'Save',
          handler: data => {
              this.addSpaces(data.category)             
            }
          }
      ]
      });
      prompt.present();
  } 

  async editSpaces(newCategory: string, oldCategory: string){
    var spaces = [];
    let alert = this.alertCtrl.create()
    this.afDatabase.database.ref(`/categories/${oldCategory}`).on('value', itemSnapshot => {
      spaces.push({ space: itemSnapshot.key, value: itemSnapshot.val()})
    });

    for(let s in spaces){
      alert.addInput({
        type: 'checkbox',
        label: spaces[s].space,
        value: spaces[s].space,
        checked: spaces[s].value
      });
    }

    alert.addButton('Cancel')
    alert.addButton({
      text: 'Save',
      handler: data => {
        console.log(data)        
      }
    })
    this.afDatabase.database.ref(`/list/${oldCategory}`).set(newCategory);
  }

  async addSpaces(category: string){
    let spaces = [];
    let alert = this.alertCtrl.create()
    this.afDatabase.database.ref(`/spaces/`).on('value', itemSnapshot => {
      itemSnapshot.forEach(function(data){
        spaces.push(data.key);
        console.log(spaces)
      });
    });

    for(let s in spaces){
      alert.addInput({
        type: 'checkbox',
        label: spaces[s],
        value: spaces[s],
        checked: false
      });
    }

    alert.addButton('Cancel')
    alert.addButton({
      text: 'Save',
      handler: data => {
        for (let s in spaces){
          if(data.includes(spaces[s])){
            this.afDatabase.database.ref(`/categories/${category}/${spaces[s]}`).set(true);            
          }else{
            this.afDatabase.database.ref(`/categories/${category}/${spaces[s]}`).set(false);  
          }         
        }  
        this.afDatabase.database.ref(`/list/`).push(category);        
      }
    });
   
    await alert.present();   
    this.categories = []; 
  }

  alert(categoryName: string){
    this.alertCtrl.create({
      title: "Confirm Deletion",
      message: "Are you sure you want to delete category " + categoryName + "?",
      buttons: [
        {
          text: 'Confirm',
          handler: () => {
            this.removeCategory(categoryName)
          }        
        },
        {
          text: 'Cancel'
        }
      ]
    }).present();
  }

  confirmDeletion(categoryName: string){
    this.alert(categoryName)
  }

  removeCategory(categoryName: string){
    this.afDatabase.database.ref(`/list`).on('value', itemSnapshot => {
      itemSnapshot.forEach( itemSnap => {
          if(itemSnap.val() === categoryName){
            this.afDatabase.database.ref(`/list/${itemSnap.key}`).remove()
            this.afDatabase.database.ref(`/categories/${itemSnap.val()}`).remove()
          }
      });
    });
    this.loadCategories()
  }

  updateCategory(id: string, value: string){
    const prompt = this.alertCtrl.create({
      title: 'New Category',
      inputs: [
          {
          name: 'category',
          placeholder: value,
          value: value
          },
      ],
      buttons: [
          {
          text: 'Cancel',
          handler: data => {
              console.log('Cancel clicked');
              }
          },
          {
          text: 'Save',
          handler: data => {
              this.afDatabase.database.ref(`/list/${id}`).set(value); 
              this.categories.length = 0
            }
          }
      ]
      });
      prompt.present();
  }

  hide(){
    this.hideDiv = !this.hideDiv
  }

}
