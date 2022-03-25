#!/usr/bin/env node

// npm
import meow from "meow"
import { readPackageUpAsync } from 'read-pkg-up'

// self
import { rotj } from "./index.js"

// readPackageUp with version 9.1.0
const { packageJson: { version, name }} = await readPackageUpAsync()

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

if (!cli.input.lengh) cli.showHelp()

const all = await rotj(cli)
console.error("ALL", all)
