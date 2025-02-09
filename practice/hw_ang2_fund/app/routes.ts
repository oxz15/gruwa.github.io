import { Routes } from '@angular/router';
import { resolve } from 'path';

import { Error404Component } from './error/404.component';
import { 
    CreateEventComponent,
    EventDetailsComponent,
    EventListResolver,
    EventsListComponent,
    CreatSessionComponent,
    EventResolver
} from './events/index';

export const appRoutes:Routes = [
    { path: 'events/new', component: CreateEventComponent, canDeactivate: ['canDeactivateCreateEvent'] },
    { path: 'events/session/new', component: CreatSessionComponent },
    { path: 'events', component: EventsListComponent, resolve: {events:EventListResolver} },
    { path: 'events/:id', component: EventDetailsComponent, resolve: {event: EventResolver} },
    { path: '404', component: Error404Component },
    { path: '', redirectTo: '/events', pathMatch: 'full' }, // этой строчкой выполняется
    //редирект, если будет пустой путь то происходит перенаправление на путь 
    // '/events' 
    { path: 'user', loadChildren: 'app/user/user.module#UserModule' }
    //при подключении дочернего роута, указывается путь и его класс через #
] 