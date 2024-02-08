/* IF YOU'RE LOOKING FOR CommonModule OR HttpClientModule, USE SHAREDMODULE!!! */
import { SharedModule } from './shared/shared.module';
import { Component, NgModule } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { EditorComponent } from './editor/editor.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SharedModule, RouterOutlet, RouterLink, RouterLinkActive, HttpClientModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'fugue';
  imagePath: any;
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