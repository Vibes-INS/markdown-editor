import { DBConfig } from 'ngx-indexed-db'

const dbConfig: DBConfig  = {
  name: 'markdown-editor',
  version: 1,
  objectStoresMeta: [
    {
      store: 'image',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [
        { name: 'base64', keypath: 'base64', options: { unique: false } },
        { name: 'created_time', keypath: 'created_time', options: { unique: false } }
      ]
    }
  ]
}

export interface ImageDoc {
  id: number
  base64: string
  created_time: Date
}

export default dbConfig
