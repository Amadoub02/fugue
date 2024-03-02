import { Routes } from '@angular/router';

import { EditorComponent } from './editor/editor.component';
import { HomepageComponent } from './homepage/homepage.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
    { path: '', component: HomepageComponent },
    { path: 'editor', component: EditorComponent},
    { path: 'login', component: LoginComponent }
];
