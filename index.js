// core
import { createWriteStream } from "node:fs"
import { open } from "node:fs/promises"
import { pipeline } from "node:stream/promises"
import { format, parse } from "node:path"

// npm
import sharp from "sharp"

const supportedExt = ["jpg", "jpeg"].map((x) => "." + x)

async function rotOne(options, ifn) {
  let { dir, name, ext } = parse(ifn)
  if (!supportedExt.find((el) => el === ext.toLocaleLowerCase()))
    throw new Error("Unsupported extension.")

  let info

  const rotj = sharp()
    .rotate()
    // .resize(null, 200)
    .toBuffer(function (err, outputBuffer, _info) {
      if (err) throw err
      info = _info
      return outputBuffer
    })
  
  name += "-rotj"
  const ofn = format({
    dir: options?.nodir ? "." : dir,
    name,
    ext,
  })

  let fd
  try {
    fd = await open(ifn)
    await pipeline(
      fd.createReadStream() ,
      rotj, 
      createWriteStream(ofn, { encoding: null, flags: options.overwrite ? "w" : "wx" })
    )  
  } finally {
    await fd?.close()
  }

  return {
    ifn,
    ofn,
    info,
  }
}

const rotj = async (cli) => Promise.all(cli.input.map(rotOne.bind(null, cli.flags)))

export { rotj }
