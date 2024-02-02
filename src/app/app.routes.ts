import { Routes } from '@angular/router';

import { EditorComponent } from './editor/editor.component';
import { HomepageComponent } from './homepage/homepage.component';

export const routes: Routes = [
    { path: '', component: HomepageComponent },
    { path: 'editor-component', component: EditorComponent}
];
