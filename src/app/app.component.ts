/* IF YOU'RE LOOKING FOR CommonModule OR HttpClientModule, USE SHAREDMODULE!!! */
import { SharedModule } from './shared/shared.module';
import { Component, NgModule } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd, Event, Router } from '@angular/router';
import { EditorComponent } from './editor/editor.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { TutorialsComponent } from './tutorials/tutorials.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SharedModule, RouterOutlet, RouterLink, RouterLinkActive, HttpClientModule, FormsModule, LoginComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'fugue';
  imagePath: any;
  isLogin: boolean = false;

  constructor(private router: Router){
    router.events.subscribe((event: Event) => {
      if(event instanceof NavigationEnd) {
        this.isLogin = event.url === '/login';
      }
    });
  }
  isOpen: boolean = false;
  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }
}


@NgModule({
  declarations: [
    EditorComponent,
  ],
  imports: [
    FormsModule,
  ],
  providers: [],
  bootstrap: [EditorComponent]
})
export class AppModule { }