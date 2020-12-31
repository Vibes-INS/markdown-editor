import { Component } from '@angular/core'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.styl']
})
export class AppComponent {
  markdown = ''

  updateMarkdownContent(content: string) {
    this.markdown = content
  }

}
