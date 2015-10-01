/**
* log.js
*
* @description :: utilities service
* @docs        :: http://sailsjs.org/#!documentation/services
*/

import util from 'util'
import _s from 'underscore.string'
import chalk from 'chalk'
import is from 'is_js'


/**
 * console success or failure messages with colors
 */
export class Log {

  constructor(fn, level) {

    // set function name
    this.fn = fn

    // change logging level
    switch(level) {
      case 'silent':
        this.log = ()=>{}
        break;
      case 'silly':
        this.log = sails.log.silly
        break;
      case 'verbose':
        this.log = sails.log.verbose
        break;
      case 'debug':
        this.log = sails.log
        break;
      case 'warn':
        this.log = sails.log.warn
        break;
      case 'error':
        this.log = sails.log.error
        break;
      case 'default':
        this.log = sails.log
        break;
      default:
        this.log = sails.log
    }
  }


  inspectArguments(args) {

    // set inspect options for deep printing of objects
    const inspectOptions = { showHidden: false, depth: null }

    // return array of string then objects if first argument is s tring
    if (is.string(args['0'])) {

      // remove first element of arguments
      const firstString = args['0']
      delete args['0']

      // return array of args
      return [
        firstString,
        util.inspect(args, inspectOptions)
      ]

    } else {

      // just return args
      return util.inspect(args, inspectOptions)
    }
  }


  // TODO: make this work
  logNormal(args, color) {
    this.log(args)
  }


  logDeep(args, color) {

    // get first string and arguments
    const _args = this.inspectArguments(args)
    // hasFirstString if array
    const hasFirstString = is.array(_args)

    let stringPlusArgs
    if (hasFirstString) {
      if (_args[1] !== '{}' && is.not.empty(_args[1])) {
        stringPlusArgs = color(_args[0] + ':') + ' ' + _args[1]
      } else {
        stringPlusArgs = color(_args[0])
      }
    }

    this.log(
      // first print function in color
      color(this.fn ? this.fn : ''),

      // then print first string or rest of args
      stringPlusArgs ? stringPlusArgs : _args
    )
  }

  // custom loggers
  trace() { this.logDeep(arguments, chalk.bgBlue.black) }
  success() { this.logDeep(arguments, chalk.bgGreen.black) }
  failure() { this.logDeep(arguments, chalk.bgRed.black) }
  heap() { this.logDeep(arguments, chalk.bgYellow.black) }
  criticalFailure() { this.logDeep(arguments, chalk.bgRed.black); Utils.x() } // fail then quit
}
