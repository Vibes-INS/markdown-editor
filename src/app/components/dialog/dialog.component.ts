import { Component, ElementRef, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core'

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.styl'],
})
export class DialogComponent {
  @Output() cancel = new EventEmitter<void>()
  @Output() ok = new EventEmitter<void>()

  @Input() width: number
  @Input() private maskCancelable = true
  @Input() set open(val: boolean) {
    this.dialogElement.nativeElement.open = val
    if (val) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = null
    }
  }
  @Input() footer: TemplateRef<Element>
  @ViewChild('dialogElement', { static: true }) private readonly dialogElement: ElementRef<HTMLDialogElement>

  clickMask() {
    if (!this.maskCancelable) {
      return
    }

    this.cancel.emit()
  }
}
