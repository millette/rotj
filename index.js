// core
import { createWriteStream } from "node:fs"
import { open } from "node:fs/promises"
import { pipeline } from "node:stream/promises"
import { format, parse } from "node:path"

// npm
import sharp from "sharp"

const supportedExt = ["jpg", "jpeg"].map((x) => "." + x)

async function rotOne(options, ifn) {
  const now = Date.now()
  let { dir, name, ext } = parse(ifn)
  if (!supportedExt.find((el) => el === ext.toLocaleLowerCase()))
    throw new Error("Unsupported extension.")

  let info

  // shouldn't perform unneeded rotate
  const rotj = sharp()
    .rotate()
    // .resize(null, 200)
    .toBuffer(function (err, outputBuffer, { format, ..._info } ) {
      if (err) throw err
      if (format !== "jpeg") console.error(`Expected jpeg format, got ${format} instead.`)
      info = _info
      return outputBuffer
    })
  

  name += "-rotj"
  const ofn = format({
    dir: options?.nodir ? "." : dir,
    name,
    ext,
  })

  let bad
  let fd
  let origSize
  try {
    fd = await open(ifn)
    const st = await fd.stat()
    origSize = st.size
    await pipeline(
      fd.createReadStream() ,
      rotj, 
      createWriteStream(ofn, { encoding: null, flags: options.overwrite ? "w" : "wx" })
    )  
  } catch (e) {
    bad = e
  } finally {
    await fd.close()
    if (bad) return bad
    return new Promise((resolve) => {
      const timer = setInterval(() => {
        if (!info) return
        const { width, height, size } = info
        const factor = (size / origSize).toFixed(2)
        const transform = `${width} x ${height}; ${size} bytes (was ${origSize} bytes; ${factor}x larger)`
        clearInterval(timer)
        const elapsed = Date.now() - now
        resolve({
          input: ifn,
          output: ofn,
          transform,
          elapsed,
        })        
      }, 0)
    })
  }
}

const rotj = async (cli) => Promise.all(cli.input.map(rotOne.bind(null, cli.flags)))

export { rotj }
