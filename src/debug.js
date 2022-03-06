const parser = require("conventional-commits-parser");
const spec = require("conventional-changelog-conventionalcommits");
const through = require('through2')
const {sync} = require('conventional-commits-parser')
const core = require('@actions/core')
// import conventionalCommitsParser from 'conventional-commits-parser'
// import through from 'through2'

async function run() {
  const options = await spec();
  // const parsed = sync('feat(myscope)!: something', options.parserOpts);
  // console.log(parsed);

  // const stream = through()
  // for (const commit of ['feat(myscope)!: something']) {
  //   stream.write(commit)
  // }
  // stream.end()
  // stream
  //   .pipe(conventionalCommitsParser(options))
  //   .pipe(through.obj(function (chunk, enc, cb) {
  //     console.log(chunk)
  //     //cb()
  //   }))

  const map = {}
  map['BREAKING'] = []
  for (const message of ['feat(myscope)!: something', 'wip: oops', 'feat: cool feature']) {
    const parsed = sync(message, options.parserOpts)
    if (!parsed.type || !parsed.subject) throw new Error()
    const items = map[parsed.type] ?? []
    map[parsed.type] = items
    const prefix = parsed.scope ? `${parsed.scope}: ` : ''
    items.push(prefix + parsed.subject)

    const breakingChanges = parsed.notes.filter(x => x.title === 'BREAKING CHANGE')
    if (breakingChanges.length === 0) continue
    map['BREAKING'].push(breakingChanges.map(x => x.text))
  }

  let result = ''
  // for (const key in map) {
  //   result += `### ${key}\n\n`
  //   result += `* ${map[key].join('\n* ')}\n\n`
  // }
  for (const key in map) {
    result += `${key}\n`
    result += `• ${map[key].join('\n• ')}\n\n`
  }
  console.log(result)
  core.info('hello info')
}


run()