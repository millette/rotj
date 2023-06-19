#!/usr/bin/env node

// npm
import meow from "meow"
import { readPackageUp } from 'read-pkg-up'

// self
import { rotj } from "./index.js"

// readPackageUp with version 9.1.0
const { packageJson: { version, name }} = await readPackageUp()

const cli = meow(`
  ${name} v${version}  
  For input.jpg, the image is rotated and called input-rotj.jpg.

  Usage: ${name} *.jpg [--nodir] [--overwrite]

  Options:

  --nodir, -n      Convert files to local directory
  --overwrite, -o  Overwrite output file
  --help, -h       This help
  --version, -v    Version
  `,{
    importMeta: import.meta,
    allowUnknownFlags: false,
    flags: {
      help: {
        type: "boolean",
        shortFlag: "h",
      },
      version: {
        type: "boolean",
        shortFlag: "v",
      },
      nodir: {
        type: "boolean",
        shortFlag: "n"
      },
      overwrite: {
        type: "boolean",
        shortFlag: "o",
      }
    }
  }
)

if (!cli.input.length) cli.showHelp()

const fix = (x) => {
  if (x instanceof Error) return x.toString()
  const { input, output, transform, elapsed } = x
  return `Rotate ${input} to ${output}: ${transform} in ${elapsed}ms`
}

const out = (x) => x.map(fix).join("\n")
rotj(cli).then(out).then(console.log).catch(console.error)
