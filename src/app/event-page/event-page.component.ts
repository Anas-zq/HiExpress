import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Card } from '../card';
import { AngularFirestore } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AddEditEventComponent } from '../add-edit-event/add-edit-event.component';
import { ChartOptions, ChartType } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { ChartDataSets } from 'chart.js';


@Component({
  selector: 'app-event-page',
  templateUrl: './event-page.component.html',
  styleUrls: ['./event-page.component.scss']
})
export class EventPageComponent implements OnInit {
  cards: RE[] = [];
  filterCards : RE[] = [];
  playground: boolean = true;
  totalRevenue: number = 0;
  totalExpenses: number = 0;
  month = "12";
  year = "2021";
  public searchStr: string = "";

  thisInputRevenueData: number[] = [];
  thisInputExpensesData: number[] = [];
  thisinputLabels: string[] = [];

  public barChartColors: Color[] = [
    { backgroundColor: 'green', borderColor: 'green' },{ backgroundColor: 'red', borderColor: 'red' }
  ]
  barChartOptions: ChartOptions = {
    responsive: true,
  };
  barChartLabels: Label[] = [];
  barChartType: ChartType = 'bar';
  barChartLegend = false;
  barChartPlugins = [];

  barChartData: ChartDataSets[] = [];

  constructor(
    private router: Router,
    private firestore: AngularFirestore,
    private modalService: NgbModal
  ) {
    this.firestore.collection('Revenues').snapshotChanges().subscribe(data => {
      var today = new Date();
      var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
      this.month = mm;
      this.totalRevenue = 0;
      this.totalExpenses = 0;
      this.cards = data.map(e => {
        return {
          id: e.payload.doc.id,
          name: e.payload.doc.get("name"),
          type: e.payload.doc.get("type"),
          value: e.payload.doc.get("value"),
          description: e.payload.doc.get("description"),
          dateEvent: e.payload.doc.get("dateEvent"),
          userId: e.payload.doc.get("userId"),
        }
      }).filter(e => e.userId == localStorage.getItem('id'));
      this.cards.forEach(element => {
        if (element.type == "Revenue" && element.dateEvent.toString().split("-")[1] == this.month)
          this.totalRevenue += element.value;
        if (element.type == "Expenses" && element.dateEvent.toString().split("-")[1] == this.month)
          this.totalExpenses += element.value;
      });
      this.thisinputLabels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '21', '23', '24', '25', '26', '27', '28', '29', '30', '31'];
      this.barChartLabels = this.thisinputLabels;
      this.thisInputRevenueData = new Array(this.thisinputLabels.length - 1).fill(0);
      this.thisInputExpensesData = new Array(this.thisinputLabels.length - 1).fill(0);
      this.cards.forEach(element => {
        if (element.type == "Revenue" && element.dateEvent.toString().split("-")[1] == this.month){
          this.thisInputRevenueData[parseInt(element.dateEvent.toString().split("-")[2]) - 1] += element.value;
        }
        if (element.type == "Expenses" && element.dateEvent.toString().split("-")[1] == this.month){
          this.thisInputExpensesData[parseInt(element.dateEvent.toString().split("-")[2]) - 1] += element.value;
        }
      });
      this.filterCards = [...this.cards];
      this.barChartData = [{ data: this.thisInputRevenueData, label: "Revenue" },{ data: this.thisInputExpensesData, label: "Expenses" }]
    });


  }

  ngOnInit(): void {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    // var todayS = yyyy + '-' + mm + '-' +dd ;
    this.month = mm;

  }
  addCard() {
    const modalRef = this.modalService.open(AddEditEventComponent);
    modalRef.componentInstance.editMode = false;
    modalRef.componentInstance.editEventId = 0;
    modalRef.closed.subscribe(e => {
      this.totalRevenue = 0;
    this.totalExpenses = 0;
      this.reCalculate();
    });
  }
  editCard(card: any) {
    const modalRef = this.modalService.open(AddEditEventComponent);
    modalRef.componentInstance.editMode = true;
    modalRef.componentInstance.editEventId = card.id;
    modalRef.closed.subscribe(e => {
      this.totalRevenue = 0;
    this.totalExpenses = 0;
      this.reCalculate();
    });
  }
  deleteCard(card: any) {
    this.firestore.doc('Revenues/' + card.id).delete();
    this.totalRevenue = 0;
    this.totalExpenses = 0;
    this.reCalculate();
  }
  reCalculate() {
    this.totalRevenue = 0;
    this.totalExpenses = 0;
    this.thisInputRevenueData = new Array(this.thisinputLabels.length - 1).fill(0);
    this.thisInputExpensesData = new Array(this.thisinputLabels.length - 1).fill(0);
    this.cards.forEach(element => {
      debugger;
      if (element.type == "Revenue" && element.dateEvent.toString().split("-")[0] == this.year && element.dateEvent.toString().split("-")[1] == this.month)
      {
        this.totalRevenue += element.value;
        this.thisInputRevenueData[parseInt(element.dateEvent.toString().split("-")[2]) - 1] += element.value;
      }
      if (element.type == "Expenses" && element.dateEvent.toString().split("-")[0] == this.year && element.dateEvent.toString().split("-")[1] == this.month)
      {
        this.totalExpenses += element.value;
        this.thisInputExpensesData[parseInt(element.dateEvent.toString().split("-")[2]) - 1] += element.value;
      }
    });
    this.filterCards = [...this.cards];
    this.barChartData = [{ data: this.thisInputRevenueData, label: "Revenue" },{ data: this.thisInputExpensesData, label: "Expenses" }]

  }
  public modelChange(str: string): void {
    this.searchStr = str;
    str = str.toLowerCase();
    this.filterCards = this.cards.filter( e => e.name.toLowerCase().includes(str) || e.type.toLowerCase().includes(str) || e.value.toString().toLowerCase().includes(str) || e.dateEvent.toString().toLowerCase().includes(str));
    // Add code for searching here
  }

  SignOut(){
    localStorage.setItem('id',"");
    this.router.navigate(['loginPage']);
  }
}

 class RE{
  name : string ;
  type : string;
  description : string;
  value : number;
  dateEvent : Date;

  constructor(n :string, t :string , d:string , v : number, da : Date){
    this.name = n;
    this.type = t;
    this.description = d;
    this.value  = v;
    this.dateEvent = da;
  }
}
