import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import {
  ActivatedRoute,
  Router
} from '@angular/router';
import {ShiftsService} from '../services/shifts.service';
import {LocalStorageService} from 'ngx-webstorage';
import {HttpService} from '../../shared/services/http.service';
import {IFooterRequest} from '../../shared/interfaces/types.interface';
import {ITabTypesShifts} from '../../shared/interfaces/types.interface';
import {FlowService} from '../../shared/services/flow.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {ToastrService} from 'ngx-toastr';
import {DataService} from '../../shared/services/data.service';

/**
 * Details Shifts Component
 */

@Component({
  selector: 'app-details-shifts',
  templateUrl: './details-shifts.component.html',
  styleUrls: ['./details-shifts.component.scss']
})
export class DetailsShiftsComponent implements OnInit, OnDestroy {

  /**
   * Variable of spinner
   * @type {boolean}
   * @memberof DetailsShiftsComponent
   */

  public iconLeft: string = 'close';

  /**
   * Variable headerDescription
   * @type {string}
   * @memberof DetailsShiftsComponent
   */

  public descriptionLeft: string;

  /**
   * Variable spinner
   * @type {boolean}
   * @memberof DetailsShiftsComponent
   */

  public spinner: boolean = false;

  /**
   * Variable shiftActiveId
   * @type {string}
   * @memberof DetailsShiftsComponent
   */

  public shiftActiveId: string;

  /**
   * Variable shiftActive
   * @type {object}
   * @memberof DetailsShiftsComponent
   */

  public shiftActive: object;

  /**
   * Variable of tab
   * @type {ITabTypesShifts}
   * @memberof DetailsShiftsComponent
   */

  public tab: ITabTypesShifts = 'upcoming';

  /**
   * Variable of footerDescription
   * @type {IFooterRequest}
   * @memberof DetailsShiftsComponent
   */

  public footerDescription: IFooterRequest;

  /**
   * Variable of footerActive
   * @type {boolean}
   * @memberof DetailsShiftsComponent
   */

  public footerActive: boolean = true;

  /**
   * Variable of ngUnsubscribe
   * @type {Subject<void>}
   * @memberof DetailsShiftsComponent
   */

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  /**
   * Variable of status
   * @type {string}
   * @memberof DetailsShiftsComponent
   */

  public status: string;

  /**
   * Creates an instance of DetailsShiftsComponent
   * @param {ActivatedRoute} route
   * @param {ShiftsService} shiftsService
   * @param {LocalStorageService} localStorage
   * @param {Router} router
   * @param {HttpService} httpService
   * @param {FlowService} flowService
   * @param {ToastrService} toastr
   * @param {DataService} dataService
   * @memberof DetailsShiftsComponent
   */

  constructor(private route: ActivatedRoute,
              private shiftsService: ShiftsService,
              private localStorage: LocalStorageService,
              private httpService: HttpService,
              private flowService: FlowService,
              private router: Router,
              private toastr: ToastrService,
              private dataService: DataService) {
  }

  /**
   * Method ngOnInit
   * @returns {void}
   * @memberof DetailsShiftsComponent
   */

  public ngOnInit(): void {
    this.flowService.dataSmallSpinner$.pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe(this.spinnerShow.bind(this));
    this.flowService.dataSmallSpinner$.next(true);
    this.tab = this.localStorage.retrieve('tab');
    this.shiftActiveId = this.route.snapshot.params['id'];

    if (this.flowService[`${this.dataService.FLOW[this.tab]}`] === undefined) {
      this.httpService.getShifts(this.tab);
      this.flowService[`${this.dataService.FLOW[this.tab]}`].pipe(
        takeUntil(this.ngUnsubscribe)
      ).subscribe();
    }

    this.getShifts();
  }

  /**
   * Method getDataShift
   * @returns {void}
   * @memberof DetailsShiftsComponent
   */

  private getShifts(): void {
    this.flowService[`${this.dataService.FLOW[this.tab]}`].pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe(
      (value) => {

        for (const i in this.dataService.FLOW) {
          if (this.flowService[`${this.dataService.FLOW[i]}`] === undefined) {
            this.httpService.getShifts(<ITabTypesShifts>i);
          }
        }

        const item: any = value['items'].find(result => result.shiftID === this.shiftActiveId);

        this.shiftActive = {
          item: item,
          locationList: value.locationList,
          stationList: value.stationList,
          jobList: value.jobList
        };

        if (this.shiftActive['item'] === undefined) {
          this.router.navigate(['/' + this.route.snapshot.params['group'], 'shifts']);
        } else {
          this.descriptionLeft = this.tab === 'upcoming' ? 'Upcoming shift' : 'Available shift';
          this.descriptionLeft = this.shiftActive['item'].shiftTitle === undefined ?
            this.descriptionLeft : this.shiftActive['item'].shiftTitle;

          if (this.shiftActive['item'].isDropRequest && this.shiftActive['item'].isPickupRequest) {
            this.status = this.dataService.STATUS[`${this.dataService.SHIFT_REQUEST[this.tab]}`];
            this.footerActive = false;
          }
          if (!this.shiftActive['item'].isDropRequest && this.shiftActive['item'].isPickupRequest) {
            this.status = this.dataService.STATUS['pickup request'];
            this.footerActive = false;
          }
          if (!this.shiftActive['item'].isDropRequest && !this.shiftActive['item'].isPickupRequest) {
            this.status = this.dataService.STATUS['scheduled'];
            this.footerActive = true;
          }
          if (this.shiftActive['item'].isDropRequest && !this.shiftActive['item'].isPickupRequest) {
            this.status = this.dataService.STATUS['drop request'];
            this.footerActive = false;
          }

          this.setFooterRequest();
        }

      }
    );
  }

  /**
   * Method for set description for FooterRequest
   * @returns {void}
   * @memberof DetailsShiftsComponent
   */

  private setFooterRequest(): void {
    if (this.tab === 'upcoming') {
      this.footerActive ? this.footerDescription = this.dataService.FOOTER_REQUESTS[0]
        : this.footerDescription = this.dataService.FOOTER_REQUESTS[1];
    }
    if (this.tab === 'available') {
      this.footerActive ? this.footerDescription = this.dataService.FOOTER_REQUESTS[2]
        : this.footerDescription = this.dataService.FOOTER_REQUESTS[3];
    }

    this.flowService.dataSmallSpinner$.next(false);
  }

  /**
   * Method for click on footer
   * @returns {void}
   * @memberof DetailsShiftsComponent
   */

  public clickFooter(): void {
    this.footerActive = !this.footerActive;

    if (!this.footerActive) {
      this.shiftActive['item'][`${this.dataService.SHIFT_ACTIVE[this.tab]}`] = true;

      if (this.tab === 'upcoming') {
        this.status = this.dataService.STATUS['drop request'];
      }
      if (this.tab === 'available') {
        this.status = this.dataService.STATUS['pickup request'];
      }
    } else {
      this.shiftActive['item'].isDropRequest = false;
      this.shiftActive['item'].isPickupRequest = false;
      this.status = this.dataService.STATUS['scheduled'];
    }

    const markState: object = {
      'isDropRequest': this.shiftActive['item'].isDropRequest,
      'isPickupRequest': this.shiftActive['item'].isPickupRequest
    };

    this.httpService.patchMarkState(this.route.snapshot.params['id'], markState).pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe((resp) => {
      this.toastr.success(this.dataService.httpSuccessResponse['save']);
      this.flowService[`${this.dataService.FLOW[this.tab]}`].pipe(
        takeUntil(this.ngUnsubscribe)
      ).subscribe((data) => {
        for (const key in data['items']) {
          if (data['items'][key].shiftID === resp.items[0].shiftID) {
            data['items'][key] = resp.items[0];
          }
        }
      });
    });
    this.setFooterRequest();
  }

  /**
   * Method fo show spinner
   * @returns {void}
   * @param {boolean} event
   * @memberof DetailsShiftsComponent
   */

  private spinnerShow(event: boolean): void {
    this.spinner = event;
  }

  /**
   * Method fo close shift and router on shifts page
   * @returns {void}
   * @param {any} event
   * @memberof DetailsShiftsComponent
   */

  public closeOurPage(event?: any): void {
    if (event === 'iconLeft') {
      this.router.navigate(['/' + this.route.snapshot.params['group'], 'shifts']);
    }
  }

  /**
   * Method ngOnDestroy
   * @returns {void}
   * @memberof DetailsShiftsComponent
   */

  public ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
