// core
import { createWriteStream } from "node:fs"
import { open } from "node:fs/promises"
import { pipeline } from "node:stream/promises"
import { format, parse } from "node:path"
// import { basename, format, parse } from "node:path"
// import process from "node:process"

// npm
import sharp from "sharp"
import meow from "meow"
import { readPackageUpAsync } from 'read-pkg-up'

// readPackageUp with version 9.1.0
const { packageJson: { version, name, ...rest }} = await readPackageUpAsync()

const cli = meow(`
  ${name} v${version}  
  For input.jpg, the image is rotated and called input-rotj.jpg.

  Usage: ${name} *.jpg [--nodir] [--overwrite]
  `,{
    importMeta: import.meta,
    allowUnknownFlags: false,
    flags: {
      help: {
        type: "boolean",
        alias: "h",
      },
      version: {
        type: "boolean",
        alias: "v",
      },
      nodir: {
        type: "boolean",
      },
      overwrite: {
        type: "boolean",
        alias: "o",
      }
    }
  }
)

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

const all = await Promise.all(cli.input.map(rotOne.bind(null, cli.flags)))
console.error("ALL", all)
