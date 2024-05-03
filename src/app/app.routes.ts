import { Routes } from '@angular/router';

import { EditorComponent } from './editor/editor.component';
import { HomepageComponent } from './homepage/homepage.component';
import { TutorialsComponent } from './tutorials/tutorials.component';

export const routes: Routes = [
    { path: '', component: HomepageComponent },
    { path: 'editor', component: EditorComponent},
    { path: 'tutorials', component: TutorialsComponent }
];
