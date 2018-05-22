import { get } from 'lodash'

export const prepareResponse = (query, output) => {
  if (get(query, 'pretty')) {
    return `<pre>${JSON.stringify(output, null, 3)}</pre>`
  }
  return JSON.stringify(output)
}
