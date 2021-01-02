import { Observable } from 'rxjs'

export function fileToBase64(file: File): Observable<string> {
  return new Observable(subscriber => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = function (e) {
      subscriber.next(e.target.result as string)
      subscriber.complete()
    }
  })
}

export function sleep(ms: number): Promise<number> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
