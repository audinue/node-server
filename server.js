import { createServer } from 'http'

let serve = async ({
  fetch,
  port = 3000,
  error = error => new Response(error?.stack, { status: 500 }),
  serverError = console.error
}) => {
  let server = createServer(async (req, res) => {
    try {
      let method = req.method
      let url = new URL('http://' + req.headers['host'] + req.url)
      let headers = new Headers()
      for (let key in req.headers) {
        let value = req.headers[key]
        if (Array.isArray(value)) {
          for (let element of value) {
            headers.append(key, element)
          }
        } else {
          headers.append(key, value)
        }
      }
      let body = null
      if (method !== 'GET' && method !== 'HEAD') {
        let it = req.iterator()
        body = new ReadableStream({
          async pull (controller) {
            let { value, done } = await it.next()
            if (done) {
              controller.close()
            } else {
              controller.enqueue(new Uint8Array(value))
            }
          }
        })
      }
      let request = new Request(url, { method, headers, body, duplex: 'half' })
      let response = null
      try {
        response = await fetch(request)
      } catch (e) {
        response = error(e)
      }
      res.statusCode = response.status
      res.statusMessage = response.statusText
      for (let [key, value] of response.headers) {
        res.appendHeader(key, value)
      }
      if (response.body) {
        for await (let value of response.body.values()) {
          await new Promise((resolve, reject) => {
            res.write(value, error => {
              if (error) {
                reject(error)
              } else {
                resolve()
              }
            })
          })
        }
      }
      await new Promise(resolve => res.end(resolve))
    } catch (e) {
      serverError(e)
    }
  })
  await new Promise((resolve, reject) => {
    server.on('error', reject)
    server.listen(port, () => {
      server.off('error', reject)
      resolve()
    })
  })
  return {
    destroy: () =>
      new Promise(resolve => {
        server.once('close', resolve)
        server.close()
      })
  }
}

export { serve }
