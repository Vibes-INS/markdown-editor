import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core'
import { fromEvent, Observable, Subject, Subscription } from 'rxjs'
import { debounceTime, switchMap, tap } from 'rxjs/operators'
import { NgxIndexedDBService } from 'ngx-indexed-db'
import { fileToBase64 } from '../../utils'
import { ImageDoc } from '../../config/db-config'

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.styl']
})
export class EditorComponent implements OnInit, OnDestroy {
  private _content = ''
  get content(): string {
    return this._content
  }
  set content(val: string) {
    this._content = val
    this.changeSubject.next(val)
  }

  private readonly imageDbname = 'image'

  @Output() private readonly changeContent = new EventEmitter<string>()

  private readonly subscribers: Subscription[] = []
  private readonly changeSubject = new Subject<string>()
  private readonly inputFileElement: HTMLInputElement

  @ViewChild('dialogElement', { static: true }) private readonly dialogElement: ElementRef<HTMLDialogElement>
  private _showImageDialog = false
  set showImageDialog(val: boolean) {
    this._showImageDialog = val
    this.dialogElement.nativeElement.open = val
    if (this.dialogElement.nativeElement.open) {
      this.queryImageAll().subscribe()
    }
  }
  imageList: ImageDoc[]

  constructor(
    private db: NgxIndexedDBService,
  ) {
    this.inputFileElement = document.createElement('input')
    this.inputFileElement.type = 'file'
    this.inputFileElement.accept = 'image/*'
  }

  ngOnInit(): void {
    const { imageDbname } = this

    const contentChangeSubscriber = this.changeSubject
      .pipe(debounceTime(500))
      .subscribe(content => this.changeContent.emit(content))

    const uploadImageSubscriber = fromEvent(this.inputFileElement, 'input')
      .pipe(
        switchMap(ev => fileToBase64((ev.target as HTMLInputElement).files[0])),
        switchMap(base64 => this.db.add(imageDbname, {
          base64,
          created_time: new Date(),
        }))
      )
      .subscribe(id => {
        this.addImageToContent(id)
      })

    this.subscribers.push(contentChangeSubscriber)
    this.subscribers.push(uploadImageSubscriber)
  }

  ngOnDestroy(): void {
    this.subscribers.forEach(subscriber => subscriber.unsubscribe())
  }

  uploadImage(): void {
    this.inputFileElement.click()
  }

  addImageToContent(id: number): void {
    this.content += `![left](base64:${id})\n`
    this.showImageDialog = false
  }

  queryImageAll(): Observable<ImageDoc[]> {
    return this.db.getAll(this.imageDbname).pipe(tap((docs: ImageDoc[]) => this.imageList = docs))
  }

  delImage(id: number): void {
    this.db.delete(this.imageDbname, id)
      .pipe(switchMap(() => this.queryImageAll()))
      .subscribe()
  }
}
