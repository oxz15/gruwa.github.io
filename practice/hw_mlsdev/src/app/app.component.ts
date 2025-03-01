import { 
    UsersService,
    IData 
} from './shared';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { 
    DomSanitizer, 
    SafeHtml 
} from '@angular/platform-browser';

import '../assets/style/style.scss';

declare let require: (filename: string) => any;

@Component({
    selector: 'my-app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    
    activeUser: IData;
    svg: SafeHtml;
    svgContent: string = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 18 18"> <defs> <style> .cls-1 { fill: black; fill-rule: evenodd;}</style> </defs> <path class="cls-1" d="M16.452,1.715A0.163,0.163,0,0,0,16.279,1.7L0.6,9.635a0.159,0.159,0,0,0-.088.156,0.162,0.162,0,0,0,.112.14L5.59,11.492a0.161,0.161,0,0,0,.157-0.034l7.545-6.386L7.5,11.865a0.16,0.16,0,0,0-.032.149,0.162,0.162,0,0,0,.108.107l5.822,1.756a0.161,0.161,0,0,0,.127-0.014,0.162,0.162,0,0,0,.077-0.1L16.509,1.879A0.161,0.161,0,0,0,16.452,1.715ZM9.276,13.856l-1.609-.49a0.161,0.161,0,0,0-.209.153v3.007a0.16,0.16,0,0,0,.117.154,0.168,0.168,0,0,0,.045.006,0.163,0.163,0,0,0,.136-0.074l1.609-2.517a0.156,0.156,0,0,0,.015-0.141A0.162,0.162,0,0,0,9.276,13.856Z"/></svg>';
    
    constructor(
        private usersService: UsersService,
        public router: Router,
        private sanitizer: DomSanitizer) { }
        
        ngOnInit() {
            this.usersService.activeUser$.subscribe(this.activeUserObserver.bind(this));
            this.svg = this.sanitizer.bypassSecurityTrustHtml(this.svgContent);
        }
        
        activeUserObserver(eventData: IData) {
            this.activeUser = eventData;       
    }
    
    activeUserPage() {
        this.router.navigate(['/users/' + this.activeUser.id]);
    }
}
