import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, } from '@angular/forms';
import { Inject } from "@angular/core";
import { AngularFirestore, QueryFn } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { environment } from "src/environments/environment";
import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-add-edit-event',
  templateUrl: './add-edit-event.component.html',
  styleUrls: ['./add-edit-event.component.scss']
})
export class AddEditEventComponent implements OnInit {
  @Input() editMode : boolean = false;
  @Input() editEventId: any;
  eventForm: FormGroup;
  cards : any[] = [];
  idEdit : any;
  constructor(
    private activateroute: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private firestore: AngularFirestore,
    public activeModal: NgbActiveModal
  ) {
    this.eventForm = this.fb.group({
      name: ['', []],
      value:['',[]],
      type:['',[]],
      description: ['', []],
      dateEvent: ['', []],
    });
  }

  ngOnInit(): void {
    this.CreateForm();
    this.resetForm();
    if (this.editMode) {
      this.firestore.collection('Revenues').snapshotChanges().subscribe(data => {
        this.cards = data.map(e => {
          return {
            id: e.payload.doc.id,
            name : e.payload.doc.get("name"),
            value:e.payload.doc.get("value"),
            type:e.payload.doc.get("type"),
            description : e.payload.doc.get("description"),
            dateEvent : e.payload.doc.get("dateEvent")
          } 
        });
        var card = this.cards.filter(e=> e.id == this.editEventId)[0];
        this.idEdit = card.id; 
        this.eventForm.patchValue({
          name: card.name,
          value:card.value,
          type:card.type,
          description:card.description,
          dateEvent:card.dateEvent
        })
      });

    
    }else{
      this.eventForm.patchValue({
        
        type:"Revenue"
        
      })
    }

  }
  CreateForm() {
    this.eventForm = this.fb.group({
      name: ['', []],
      value:['',[]],
      type:['',[]],
      description: ['', []],
      dateEvent: ['', []],
    });
  }
  resetForm() {
    this.eventForm.reset();
  }

  submitForm(form: any): void {
    for (const i in this.eventForm.controls) {
      this.eventForm.controls[i].markAsDirty();
      this.eventForm.controls[i].updateValueAndValidity();
    }
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var todayS = yyyy + '-' + mm + '-' +dd ;
   
    const event = {
      id: this.editMode ? this.idEdit  : 0,
      name: form.name,
      value: form.value,
      type: form.type,
      description: form.description,
      dateEvent: form.dateEvent
    }
    if(this.editMode)
      this.updateEvent(event);
    else
      this.createEvent(event);
    
    this.activeModal.close('Close click')

  }
  cancel() {
    this.router.navigate(['eventPage']);
  }
  createEvent(event: any) {
    event.userId = localStorage.getItem('id');
    return this.firestore.collection('Revenues').add(event);
  }
  updateEvent(event: any){
    event.userId = localStorage.getItem('id');
    this.firestore.doc('Revenues/' + event.id).update(event);
  }
}
