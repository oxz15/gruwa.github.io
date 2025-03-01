﻿import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {FlowService} from './shared/services/flow.service';
import {
  combineLatest,
  Subject
} from 'rxjs';
import {
  debounceTime,
  map,
  takeUntil
} from 'rxjs/operators';
import {MatSidenav} from '@angular/material';
import {GoogleAnalyticsService} from './shared/services/google-analytics.service';
import {environment} from '../environments/environment';
import {LocalStorageService} from 'ngx-webstorage';
import * as version from './shared/services/version';
import {MainService} from './shared/services/main.service';
import {DataService} from './shared/services/data.service';
import {SwipeService} from './shared/services/swipe.service';
import {ITabTypesShifts} from './shared/interfaces/types.interface';
import {HttpService} from './shared/services/http.service';
import {HttpGuardRequestService} from './shared/services/http-guard-request.service';
import {Router} from '@angular/router';
import {HttpGuardService} from './shared/services/http-guard.service';

/**
 * App Component
 */

@Component({
  selector: 'sw-app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  /**
   * Variable of spinner
   * @type {boolean}
   * @memberof ShiftsComponent
   */

  public iconLeft: string = 'arrow_back';

  /**
   * Variable of img
   * @type {object}
   * @memberof ShiftsComponent
   */

  public img: object;

  /**
   * Variable of items
   * @type {Array<object>}
   * @memberof ShiftsComponent
   */

  public items: Array<object>;

  /**
   * Variable currentYear
   * @type {number}
   * @memberof AppComponent
   */

  public currentYear: number = (new Date()).getFullYear();

  /**
   * Variable currentVersion
   * @type {string}
   * @memberof AppComponent
   */

  public currentVersion: string = version.VERSION['version'];

  /**
   * Variable arrow
   * @type {boolean}
   * @memberof AppComponent
   */

  public arrow: boolean = false;

  /**
   * Variable spinner
   * @type {boolean}
   * @memberof AppComponent
   */

  public spinner: boolean = false;

  /**
   * Variable of ngUnsubscribe
   * @type {Subject<void>}
   * @memberof AppComponent
   */

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  /**
   * Variable of roomDescription
   * @type {string}
   * @memberof AppComponent
   */

  public roomDescription: string;

  /**
   * Variable of accountDescription
   * @type {string}
   * @memberof AppComponent
   */

  public accountDescription: string;

  /**
   * Variable of sideBar
   * @type {MatSidenav}
   * @memberof AppComponent
   */

  @ViewChild('sidebar') sideBar: MatSidenav;

  /**
   * Creates an instance of AppComponent
   * @param {FlowService} flowService
   * @param {MainService} mainService
   * @param {GoogleAnalyticsService} googleAnalyticsService
   * @param {LocalStorageService} localStorage
   * @param {DataService} dataService
   * @param {HttpService} httpService
   * @param {HttpGuardRequestService} httpGuardRequestService
   * @param {Router} router
   * @param {HttpGuardService} httpGuardService
   * @memberof AppComponent
   */

  constructor(public flowService: FlowService,
              public mainService: MainService,
              private googleAnalyticsService: GoogleAnalyticsService,
              private localStorage: LocalStorageService,
              private dataService: DataService,
              private httpService: HttpService,
              private httpGuardRequestService: HttpGuardRequestService,
              private router: Router,
              private httpGuardService: HttpGuardService) {
    this.appendGaTrackingCode();
    console.log('Version of Shiftworks', version.VERSION);
  }

  /**
   * Method ngOnInit
   * @returns {void}
   * @memberof AppComponent
   */

  public ngOnInit(): void {
    this.initFlow();
    this.initHeader();
    this.getLoginForSidebar();
    this.initPopupForAddButton();
  }

  /**
   * Method initHeader
   * @returns {void}
   * @memberof AppComponent
   */

  private initHeader(): void {
    this.img = {
      url: 'assets/images/SWLogo.svg',
      class: 'header__logo'
    };
    this.items = [
      {
        iconLeft: 'account_circle',
        description: this.accountDescription
      },
      {
        iconLeft: 'room',
        description: this.roomDescription,
        iconRight: 'keyboard_arrow_up',
        iconRightSecond: 'keyboard_arrow_down',
        id: 'groupRestaurants'
      }
    ];
  }

  /**
   * Method initFlow
   * @returns {void}
   * @memberof AppComponent
   */

  private initFlow(): void {
    this.flowService.dataSpinner$.pipe(
      takeUntil(this.ngUnsubscribe),
      debounceTime(50)
    ).subscribe(this.spinnerShow.bind(this));
    this.flowService.dataSpinner$.next(true);
    this.flowService.dataSideBar$.pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe(this.sideBarShow.bind(this));
    this.flowService.dataSideBarClose$.pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe(() => {
      this.sideBar.close();
    });
    this.flowService.dataCleanFlow$.pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe(next => {
      this.mainService.cleanFlows(next);
    });

    if (this.localStorage.retrieve(this.dataService.LOCAL_STORAGE['group'])) {
      this.roomDescription = this.localStorage.retrieve(this.dataService.LOCAL_STORAGE['group']).description;
    }
    if (this.localStorage.retrieve(this.dataService.LOCAL_STORAGE['user'])) {
      this.accountDescription = this.localStorage.retrieve(this.dataService.LOCAL_STORAGE['user']);
    }

    this.localStorage.observe('group').pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe((value) => {
      if (value) {
        this.roomDescription = value.description;
        this.initHeader();
      }
    });
    this.localStorage.observe('user').pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe((value) => {
      if (value) {
        this.accountDescription = value;
        this.initHeader();
      }
    });
  }

  /**
   * Method getLoginForSidebar
   * @returns {void}
   * @memberof AppComponent
   */

  private getLoginForSidebar(): void {
    combineLatest(this.flowService.dataGroupRestaurants$, this.flowService.dataPopupPassword$).pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe(event => {
      if (event[0] && event[1]) {
        const body: object = {
          login: this.localStorage.retrieve('user'),
          password: event[1],
            groupId: event[0]['id'],
            group: event[0]['description'],
            serverName: event[0]['serverName'],
            unitID: event[0]['unitID'],
            localEmployeeID: event[0]['localEmployeeID'],
        };

        this.flowService.dataSmallSpinner$.next(true);
        this.flowService.buttonAuth$.next(true);
        this.flowService.dataPopupActive$.next(false);
        this.httpService.onLoginRequest(this.httpGuardRequestService.guardlogin(body)).pipe(
          map((value) => {
            return this.httpGuardService.guardRestaurants(value)[0];
          })
        ).subscribe(value => {
          this.flowService.activeItem$.next('shifts');
          value['activeId'] = value['id'] + '_' + this.localStorage.retrieve('user');
          this.localStorage.store('group', value);
          for (const i in this.dataService.FLOW) {
            if (this.dataService.FLOW) {
              this.flowService[`${this.dataService.FLOW[i]}`] = undefined;
              this.httpService.getShifts(<ITabTypesShifts>i);
            }
          }
          this.router.navigate(['/shifts']);
          this.flowService.dataSideBar$.next('refreshShift');
          this.sideBar.close();
          this.flowService.buttonAuth$.next(false);
        });
        this.flowService.dataGroupRestaurants$.next(null);
        this.flowService.dataPopupPassword$.next(null);
      }
    });
  }

  /**
   * Method initPopupForAddButton
   * @returns {void}
   * @memberof AppComponent
   */

  private initPopupForAddButton(): void {
    // For story 16948
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      // e.preventDefault();
      // Stash the event so it can be triggered later.
      // this.deferredPrompt = e;
      // Update UI notify the user they can add to home screen
      // this.deferredPrompt.prompt();
      console.log('We can show our popup with add button', e);
      // btnAdd.style.display = 'block';
    });

    // btnAdd.addEventListener('click', (e) => {
    //   // hide our user interface that shows our A2HS button
    //   btnAdd.style.display = 'none';
    //   // Show the prompt
    //   deferredPrompt.prompt();
    //   // Wait for the user to respond to the prompt
    //   deferredPrompt.userChoice
    //     .then((choiceResult) => {
    //       if (choiceResult.outcome === 'accepted') {
    //         console.log('User accepted the A2HS prompt');
    //       } else {
    //         console.log('User dismissed the A2HS prompt');
    //       }
    //       deferredPrompt = null;
    //     });
    // });
  }

  /**
   * Method fo show spinner
   * @returns {void}
   * @param {boolean} event
   * @memberof AppComponent
   */

  private spinnerShow(event: boolean): void {
    this.spinner = event;
  }

  /**
   * Method fo show sideBar
   * @returns {void}
   * @param {string} event
   * @memberof AppComponent
   */

  public sideBarShow(event?: string): void {
    if (event === 'iconLeft') {
      this.sideBar.toggle();
      this.arrow = false;
      this.flowService.dataSideBarGroupRestaurants$.next(false);
    }
    if (event === 'groupRestaurants') {
      this.arrow = !this.arrow;
      this.flowService.dataSideBarGroupRestaurants$.next(this.arrow);
    }
  }

  /**
   * Method appendGaTrackingCode
   * @returns {void}
   * @memberof AppComponent
   */

  private appendGaTrackingCode(): void {
    try {
      const script = document.createElement('script');
      script.innerHTML = `
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

        ga('create', '` + environment.googleAnalyticsKey + `', 'auto');
      `;
      document.head.appendChild(script);
    } catch (ex) {
      console.error('Error appending google analytics');
      console.error(ex);
    }
  }

  /**
   * Method ngOnDestroy
   * @returns {void}
   * @memberof AppComponent
   */

  public ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
