import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController } from 'ionic-angular';
import { AngularFireDatabase }from 'angularfire2/database';
import { Chart } from 'chart.js'
import * as moment from 'moment';

/**
 * Generated class for the OccupiedPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-occupied',
  templateUrl: 'occupied.html',
})
export class OccupiedPage {
  @ViewChild('misParkCanvas') misParkCanvas;
  @ViewChild('summaryCanvas') summaryCanvas;

  misParkChart: any;
  summaryChart: any;

  totalOccupied = 0
  totalSpaces = 0
  percentOccupied = 0
  public occupiedSpaces = [];
  info = []
  summary = []
  public wrongParking = [];
  public allSpaces = [];
  constructor(public alertCtrl: AlertController, public modalCtrl: ModalController, public navCtrl: NavController, public navParams: NavParams, public afDatabase: AngularFireDatabase) {
  }

  alert(space: any){
    this.alertCtrl.create({
      title: "Review Transaction DEtails",
      message: `Reservation ID: ` + space.id + `<br/> Space: ` + 
              space.value.space + `<br/> Start: ` + space.value.start
              + `<br/> End: ` + space.value.end +  `<br/> Fee: P` + space.value.fee + `.00`,      
      buttons: [
        {
          text: 'Confirm',
          handler: () => {
            this.pushPayment(space)
          }        
        },
        {
          text: 'Cancel'
        }
      ]
    }).present();
  }
 

  ionViewDidLoad() {  
    this.afDatabase.database.ref(`occupied`).orderByValue().on('value', spaceSnapshot => {
      this.occupiedSpaces = [];
      var result = spaceSnapshot.val();
      for(let k in result){
        this.occupiedSpaces.push({ id: k, value: result[k]});
      }          
    });

    
    this.showSummary()
    this.viewAll()
  
    console.log(this.allSpaces)
    this.showMisparks()
  }

  viewAll(){
    this.allSpaces = [];
    this.afDatabase.database.ref(`spaces`).orderByValue().on('value', spaceSnapshot => {
      var result = spaceSnapshot.val();
      for(let k in result){
        this.allSpaces.push({ id: k, value: result[k].status});
      }          
    });
  }

  viewAvailable(){
    this.allSpaces = []
    this.afDatabase.database.ref(`spaces`).orderByValue().on('value', spaceSnapshot => {
      var result = spaceSnapshot.val();
      for(let k in result){
        if(result[k].status==='available'){
          this.allSpaces.push({ id: k, value: result[k].status});
        }else{
          this.allSpaces.push({ id: k, value: 'light' });
        }
        
      }          
    });
  }

  viewOccupied(){
    this.allSpaces = []
    this.afDatabase.database.ref(`spaces`).orderByValue().on('value', spaceSnapshot => {
      var result = spaceSnapshot.val();
      for(let k in result){
        if(result[k].status==='occupied'){
          this.allSpaces.push({ id: k, value: result[k].status});
        }else{
          this.allSpaces.push({ id: k, value: 'light' });
        }
        
      }          
    });
  }

  findWithAttr(array: any, attr: string, value: string) {
    for(var i = 0; i < array.length; i += 1) {
        if(array[i][attr] === value) {
            return i;
        }
    }
    return -1;
  }

  showMisparks(){
    var currentValue;
    this.wrongParking = []
    this.afDatabase.database.ref(`misparking`).orderByValue().on('value', parkSnapshot => {
      var result = parkSnapshot.val();      
      for(let k in result){
        this.info = []
        var id = k.slice(0,1)

        if(this.wrongParking.some((item) => item.space === k.slice(0,1))){
          let j = this.findWithAttr(this.wrongParking, 'space', id)
          var currentArr = this.wrongParking[j].summary
          this.info.push({ space: k, value: result[k]})
          Array.prototype.push.apply(currentArr, this.info)
        }else{
          this.info.push({ space: k, value: result[k]})
          this.wrongParking.push({space: id, summary: this.info})   
        }            
      }
      console.log(this.wrongParking)
    
    })

    for(let i in this.wrongParking){
      var subtotal = 0
      var total = 0 
      var info = this.wrongParking[i].summary
      info = info.filter(function(element) { 
        return element !== undefined
      })

      for(let j in info){
        var values = info[j].value.map(function(item){ return item.value })
        info[j].subtotal = values.reduce((a, b) => a + b, 0)
        subtotal = + subtotal + values.reduce((a, b) => a + b, 0)
      }

      this.wrongParking[i].total = subtotal
    }

    console.log(this.wrongParking)
    const labels = this.wrongParking.map(function(space) { return space.space })
    const data = this.wrongParking.map(function(space) { return space.total })
    this.misParkChart = new Chart(this.misParkCanvas.nativeElement, {

      type: 'horizontalBar',
      data: {
        labels: labels,
        datasets: [{
          label: "Wrong Parkings",
          data: data,
          fill: true,
          borderWidth: 2,
          backgroundColor: '#C9AFED',
          borderColor: '#8338EC',
          hoverBackgroundColor: '#8338EC',
        }]
      },
      options: {
        maintainAspectRatio: true,
        responsive: true,
      },
     
    });

    this.misParkChart.onclick = function(event){
      console.log(this.misParkChart.getElementAtEvent(event))
    }
  }

  confirmPayment(space: any){
    this.alert(space)
   
  }

  pushPayment(space: any){
    var today = moment().format('YYYY-MM-DD')
    this.afDatabase.database.ref(`occupied/${space.id}`).remove()
    this.afDatabase.database.ref(`history/${today}`).push({ fee: space.value.fee, space: space.value.space, user: space.value.user })
    this.afDatabase.database.ref(`frequency/${today}/${space.value.space}`).once('value', snapshot => { 
      console.log(snapshot.val())
      if(snapshot){
        this.afDatabase.database.ref(`frequency/${today}/${space.value.space}`).set(snapshot.val() + 1)
      }else{
        this.afDatabase.database.ref(`frequency/${today}`).set({ [space.value.space]: 1})
        
      }
    });
  }

  viewDetails() {
    var misparkPage = this.modalCtrl.create('MisparkPage', { wrongParking: this.wrongParking})
    misparkPage.present();
   
  }

  showSummary(){
    this.afDatabase.database.ref(`total_no_of_spaces`).on('value', snapshot => {
      this.totalOccupied = 0; 
      this.totalOccupied = this.occupiedSpaces.length;
      this.totalSpaces = snapshot.val()
     
      console.log(this.totalOccupied/this.totalSpaces)
      this.percentOccupied = Math.round((this.totalOccupied / snapshot.val()) * 100)

    })
    console.log(this.totalOccupied)
    console.log(this.totalSpaces)
    this.summary.push({ status: "Available", total: this.totalSpaces - this.totalOccupied })
    this.summary.push({ status: "Occupied", total: this.totalOccupied })
    console.log(this.summary)

    const labels = this.summary.map(function(info) { return info.status })
    const data = this.summary.map(function(info) { return info.total })
    this.summaryChart= new Chart(this.summaryCanvas.nativeElement, {

      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          label: 'Reservations Today',
          data: data,
          fill: true,
          backgroundColor: [
            '#ABEBC6',
            '#F5B7B1'
          ],
          hoverBackgroundColor: [
            '#32db64',
            '#f53d3d'
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
