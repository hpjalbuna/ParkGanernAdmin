import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase }from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Chart } from 'chart.js'

/**
 * Generated class for the ReservedPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-reserved',
  templateUrl: 'reserved.html',
})
export class ReservedPage {
  @ViewChild('summaryCanvas') summaryCanvas;
  summaryChart: any;

  totalReserved = 0;
  percentReserved = 0;
  totalSpaces = 0;
  public reservedSpaces = [];
  summary = []
  public allSpaces = [];
  public spaceId = [];
  constructor(public navCtrl: NavController, public navParams: NavParams, private afDatabase: AngularFireDatabase) {
  }

  ionViewDidLoad() {
    this.allSpaces = []
    this.afDatabase.database.ref(`reservations`).orderByValue().on('value', spaceSnapshot => {
      spaceSnapshot.forEach(dataSnapshot => {
        var values = [];
        var result = dataSnapshot.val();        
        for(let k in result){
          values.push({ id: k, value: result[k] });
        }  
        this.reservedSpaces.push({ id: dataSnapshot.key, value: values });
  
      });   
             
    });

    this.viewAll();
    this.showSummary();

  
  }

  getReservations(){
    this.afDatabase.database.ref(`spaces`).orderByValue().on('value', spaceSnapshot => {
      var result = spaceSnapshot.val(); 
    
      for(let k in result){  
        for(let space in this.reservedSpaces){
          if(k === this.reservedSpaces[space].id){
            result[k].status = "reserved";            
          }
        }

        this.allSpaces.push({id: k, value: result[k].status})
      }    
    });
    return this.allSpaces
  }

  viewAll(){
    this.allSpaces =[]
    this.allSpaces = this.getReservations()
    for(let i in this.allSpaces){
      if(this.allSpaces[i].value !== 'reserved'){
        this.allSpaces[i].value = 'notreserved'
      }
    }
  }

  viewReserved(){
    this.allSpaces = []
    this.allSpaces = this.getReservations()
  
    for(let i in this.allSpaces){
      if(this.allSpaces[i].value !== 'reserved'){
        this.allSpaces[i].value = 'light'
      }
    }
  }

  viewNotReserved(){
    this.allSpaces = [];
    this.allSpaces = this.getReservations()

    for(let i in this.allSpaces){
      if(this.allSpaces[i].value !== 'reserved'){
        this.allSpaces[i].value = 'notreserved'
      }else{
        this.allSpaces[i].value = 'light'
      }
    }  
  }

  showSummary(){
    this.afDatabase.database.ref(`total_no_of_spaces`).on('value', snapshot => {
      this.totalReserved = this.reservedSpaces.length;
      this.totalSpaces = snapshot.val()
      console.log(this.totalReserved/this.totalSpaces)
      this.percentReserved = Math.round((this.totalReserved / snapshot.val()) * 100)
    })
    this.summary.push({ status: "Reserved", total: this.totalReserved })
    this.summary.push({ status: "Not Reserved", total: this.totalSpaces - this.totalReserved })
   
    console.log(this.summary)

    const labels = this.summary.map(function(info) { return info.status })
    const data = this.summary.map(function(info) { return info.total })
    this.summaryChart= new Chart(this.summaryCanvas.nativeElement, {

      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          label: labels,
          data: data,
          fill: true,
          backgroundColor: [
            '#FCF3CF',
            '#D6EAF8'
          ],
          hoverBackgroundColor: [
            '#F4D03F',
            '#5DADE2'
          ]
        }]
      },
      options: {
        maintainAspectRatio: true,
        responsive: true,
        legend: {
          position: "top"
        }
      },
     
    });
  }

}
