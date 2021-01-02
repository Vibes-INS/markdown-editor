import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core'
import { concat, forkJoin, merge, Observable, Subject } from 'rxjs'
import { debounceTime, tap } from 'rxjs/operators'
import * as MarkdownParser from 'markdown-it'
import { NgxIndexedDBService } from 'ngx-indexed-db'
import { ImageDoc } from '../../config/db-config'
// @ts-ignore
import * as markdownCss from 'src/markdown-output.css'

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: [ './view.component.styl' ],
})
export class ViewComponent implements OnInit {
  private readonly imageDbname = 'image'

  private _markdown = ''
  get markdown(): string {
    return this._markdown
  }

  @Input() set markdown(val: string) {
    this._markdown = val
    this.renderToHtmlSubject.next(val)
  }

  @ViewChild('outputElement', { static: true }) outputElement: ElementRef<HTMLDivElement>

  private readonly renderToHtmlSubject = new Subject<string>()
  private readonly parser = new MarkdownParser()

  outputDialog = false

  constructor(
    private db: NgxIndexedDBService,
  ) {
  }

  ngOnInit(): void {
    this.renderToHtmlSubject
      .pipe(debounceTime(500))
      .subscribe(markdown => this.renderMarkdownToHtml(markdown))
  }

  private renderMarkdownToHtml(markdown: string) {
    const el = document.createElement('div')
    el.innerHTML = this.parser.render(markdown.trim())

    const imageSrcToBase64List$ = Array.from(el.querySelectorAll('img'))
      .map(img => ({
        id: img.src.match(/base64:(.+)/),
        element: img as HTMLImageElement,
      }))
      .filter(item => item.id)
      .map(item => this.db.getByID(this.imageDbname, Number(item.id[1])).pipe(tap((imgDoc: ImageDoc) => item.element.src = imgDoc.base64 || 'null')))

    const render$ = new Observable(subscriber => {
      this.outputElement.nativeElement.innerHTML = ''
      this.outputElement.nativeElement.append(el)
      subscriber.next()
      subscriber.complete()
    })

    concat(forkJoin(imageSrcToBase64List$), render$).subscribe()
  }

  async outputHtml(title: string) {
    const css = markdownCss.default.replace(/\/\*(.+)\*\//, '')
    const body = this.outputElement.nativeElement.innerHTML

    // language=html
    const result = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>${title}</title>
    <style>${css}</style>
  </head>
  <body>${body}</body>
</html>`

    const blob = new Blob([ result ], { type: '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel' })
    const url3 = window.URL.createObjectURL(blob)

    const filename = 'output' + '.html'
    const link = document.createElement('a')
    link.style.display = 'none'
    link.href = url3
    link.setAttribute('download', filename)
    link.click()
  }

}
