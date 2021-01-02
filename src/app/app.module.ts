import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'

import { AppComponent } from './app.component'
import { EditorComponent } from './components/editor/editor.component'
import { ViewComponent } from './components/view/view.component'
import { FormsModule } from '@angular/forms'
import { NgxIndexedDBModule } from 'ngx-indexed-db'
import dbConfig from './config/db-config';
import { DialogComponent } from './components/dialog/dialog.component'

@NgModule({
  declarations: [
    AppComponent,
    EditorComponent,
    ViewComponent,
    DialogComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    NgxIndexedDBModule.forRoot(dbConfig),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
