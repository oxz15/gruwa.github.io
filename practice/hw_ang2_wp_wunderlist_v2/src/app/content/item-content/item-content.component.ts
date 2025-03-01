import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { EventService, IEventsItem, IEvents, RedPencilService } from './../../shared';

@Component({
    selector: 'item-content',
    templateUrl: './item-content.component.html'
})
export class ItemContentComponent implements OnInit {

    doneItem: boolean;
    starItem: boolean;
    newLists: boolean;

    @Input() item: IEventsItem;
    @Input() event: IEvents;

    constructor(private eventService:EventService,
                private redPencilService: RedPencilService) {

        }
                
    ngOnInit() {
        this.doneItem = this.item.done;
        this.starItem = this.item.star;
    }
    
    deleteItem() {
        this.eventService.deleteItem(this.item, this.event);
    }    
    
    doneItemFunc() {
        this.doneItem = true;
        this.eventService.doneItemFunc(this.item, this.doneItem);
    }

    starItemFunc() {
        this.starItem = !this.starItem;
        this.eventService.starItemFunc(this.starItem, this.item, this.event);
    }

    creatNewLists() {
        this.newLists = true;
        this.redPencilService.creatNewLists(this.newLists);
    }

}