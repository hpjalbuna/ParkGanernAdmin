import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { Chart } from 'chart.js'
import * as moment from 'moment';
import { extendMoment } from 'moment-range';
import * as sortKeys from 'sort-keys';
/**
 * Generated class for the RevenuePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-revenue',
  templateUrl: 'revenue.html',
})
export class RevenuePage {
  @ViewChild('revenueCanvas') revenueCanvas;
  @ViewChild('spaceCanvas') spaceCanvas;
  @ViewChild('frequencyCanvas') frequencyCanvas;
  @ViewChild('reservationCanvas') reservationCanvas;

  revenueChart: any
  spaceChart: any
  frequencyChart: any
  reservationChart: any

  dailyReservations = [];
  reservationToday = [];
  revenueToday = [];
  revenueStats = [];  

  todaysTotalSales = 0;
  todaysTotalReserved = 0;
  totalRevenue = 0;
  totalReserved = 0;
  todaysDate = moment().format("MMMM D, YYYY")
  constructor(public navCtrl: NavController, public navParams: NavParams, public afDatabase: AngularFireDatabase) {
  }

  ionViewDidLoad() {
    var today = moment().format("YYYY-MM-DD")

    this.afDatabase.database.ref(`/history/`).orderByKey().equalTo(today).on('value', snapshot => {
      let self=this
      snapshot.forEach(childSnapshot => {
        var data = childSnapshot.val()
        for(let i in data){
          if (self.revenueToday.filter(today => (today.space === data[i].space.slice(0,1))).length > 0){
            for(let j in self.revenueToday){
              if(self.revenueToday[j].space === data[i].space.slice(0,1)){
                self.revenueToday[j].total = this.revenueToday[j].total + data[i].fee
              }
            }            
          }else{
            self.revenueToday.push({ space: data[i].space.slice(0,1), total: data[i].fee})
          }
        }
      });
    });

   
    this.afDatabase.database.ref(`/frequency/`).orderByKey().equalTo(today).on('value', snapshot => {
      let self=this
      snapshot.forEach(function(childSnapshot){
        childSnapshot.forEach(function(freqSnapshot){
          if (self.reservationToday.filter(today => (today.space === freqSnapshot.key.slice(0,1))).length > 0){
            for(let j in self.reservationToday){
              if(self.reservationToday[j].space === freqSnapshot.key.slice(0,1)){
                self.reservationToday[j].total = self.reservationToday[j].total + freqSnapshot.val()
              }
            }
          }else{
            self.reservationToday.push({ space: freqSnapshot.key.slice(0,1), total: freqSnapshot.val() })
          }
        });
        
      });
      
    });


    this.showSales()
    this.showReservations()
    this.showTodaySales(this.revenueToday)
    this.showTodayReservations(this.reservationToday)
    this.todaysTotalReserved = this.getTotal(this.reservationToday)
    this.todaysTotalSales = this.getTotal(this.revenueToday)
  }

  ionViewWillLoad(){

  }

  getTotal(objArray: any){
    var total = 0
    objArray.forEach(data => {
      total = total + data.total
    })
    return total
  }


  showSales(query: string = "week"){
    this.revenueStats = [];
    const momentRange = extendMoment(moment)
    var range;
    switch(query){
      case 'week': {
        const start = moment().startOf('week').format('YYYY-MM-DD')
        const end = moment().endOf('week').format('YYYY-MM-DD')
        range = momentRange.range(moment(start, 'YYYY-MM-DD'), moment(end, 'YYYY-MM-DD'))
        break;
      }
      case 'month': {
        const start = moment().startOf('month').format('YYYY-MM-DD')
        const end = moment().endOf('month').format('YYYY-MM-DD')
        range = momentRange.range(moment(start, 'YYYY-MM-DD'), moment(end, 'YYYY-MM-DD'))
        break;
      }
    }
    console.log(range)
    this.afDatabase.database.ref(`/history/`).on('value', snapshot => {      
      snapshot.forEach(childSnapshot => {
        var totalRevenue = 0
        var data = childSnapshot.val();
        var date = moment(childSnapshot.key, 'YYYY-MM-DD')
        if(date.within(range)){
          for (let i in data){
            totalRevenue = totalRevenue + data[i].fee
          }
          if(query === 'week'){
            this.revenueStats.push({ date: date.format('dddd'), total: totalRevenue})
          }else if(query === 'month'){
            this.revenueStats.push({ date: date.format('MMMM D'), total: totalRevenue})
          }
          
        }
      });
    });   
 
    this.showSalesChart(this.revenueStats, query)
    this.totalRevenue = this.getTotal(this.revenueStats)
  }

  showReservations(query: string = "week"){
    this.dailyReservations = [];
    const momentRange = extendMoment(moment)
    var range;
    switch(query){
      case 'week': {
        const start = moment().startOf('week').format('YYYY-MM-DD')
        const end = moment().endOf('week').format('YYYY-MM-DD')
        range = momentRange.range(moment(start, 'YYYY-MM-DD'), moment(end, 'YYYY-MM-DD'))
        break;
      }
      case 'month': {
        const start = moment().startOf('month').format('YYYY-MM-DD')
        const end = moment().endOf('month').format('YYYY-MM-DD')
        range = momentRange.range(moment(start, 'YYYY-MM-DD'), moment(end, 'YYYY-MM-DD'))
        break;
      }
    }

    this.afDatabase.database.ref(`/frequency/`).on('value', snapshot => {
      let self=this
      snapshot.forEach(function(childSnapshot){
        var date = moment(childSnapshot.key, 'YYYY-MM-DD')
        var totalReserved = 0;
        childSnapshot.forEach(freqSnapshot => {
          totalReserved = totalReserved + freqSnapshot.val();
        });

        if(date.within(range)){
          if(query === 'week'){
            self.dailyReservations.push({ date: date.format('dddd'), total: totalReserved})
          }else if(query === 'month'){
            self.dailyReservations.push({ date: date.format('MMMM D'), total: totalReserved})
          }          
        }        
      });      
    }); 
    console.log(this.dailyReservations)
    this.showReservationsChart(this.dailyReservations)
    this.totalReserved = this.getTotal(this.dailyReservations)
  }

  showReservationsChart(dailyReservations: any){
    const labels = dailyReservations.map(function(day) { return day.date })
    const data = dailyReservations.map(function(day) { return day.total })

    this.frequencyChart = new Chart(this.frequencyCanvas.nativeElement, {

      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Reservations per day',
          data: data,
          fill: true,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'
          ],
          hoverBackgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#FF6384",
            "#36A2EB",
            "#FFCE56"
          ]
        }],
        options: {
          onClick: function(event) {
            console.log(event)
          }
        }
      }
    });
  }

  showSalesChart(revenueStats: any, viewBy: string = "week"){
    const labels = revenueStats.map(function(stat) { return stat.date })
    const data = revenueStats.map(function(stat) { return stat.total })
    this.revenueChart = new Chart(this.revenueCanvas.nativeElement, {

      type: 'line',
      data: {
        labels: labels,        
        datasets: [{
          label: "Sales per " + viewBy,
          data: data,
          backgroundColor: '#7FCBFF',
          fill: true,
          borderColor: '#004cff',
          lineTension: 0
        }]
      },
      options: {
        maintainAspectRatio: true,
        responsive: true
       
      },
     
    });
  }

  showTodayReservations(reservationToday: any){
    const labels = reservationToday.map(function(space) { return space.space })
    const data = reservationToday.map(function(space) { return space.total })
    this.reservationChart = new Chart(this.reservationCanvas.nativeElement, {

      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          label: 'Reservations Today',
          data: data,
          fill: true,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'
          ],
          hoverBackgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#FF6384",
            "#36A2EB",
            "#FFCE56"
          ]
        }]
      },
      options: {
        maintainAspectRatio: true,
        responsive: true,
        legend: {
          position: "right"
        }
      },
     
    });
  }
  

  showTodaySales(revenueToday: any){
    const labels = revenueToday.map(function(today) { return today.space })
    const data = revenueToday.map(function(today) { return today.total })
    this.spaceChart = new Chart(this.spaceCanvas.nativeElement, {

      type: 'horizontalBar',
      data: {
        labels: labels,
        datasets: [{
          label: "Today's Sales Per Area",
          data: data,
          fill: true,
          borderWidth: 2,
          backgroundColor: '#C9AFED',
          borderColor: '#8338EC',
          hoverBackgroundColor: '#8338EC'
        }]
      },
      options: {
        maintainAspectRatio: true,
        responsive: true,
        onClick: (event) => { 
          console.log(event)
        }
      },
      
     
    });
  }

}
