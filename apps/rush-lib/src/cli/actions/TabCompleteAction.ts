// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.

import { BaseRushAction } from './BaseRushAction';
import { RushCommandLineParser } from '../RushCommandLineParser';

import {
  CommandLineStringParameter,
  CommandLineIntegerParameter,
  CommandLineParameterKind
} from '@rushstack/ts-command-line';

interface IParameter {
  name: string;
  kind: CommandLineParameterKind;
}

export class TabCompleteAction extends BaseRushAction {
  private _wordToCompleteParameter: CommandLineStringParameter;
  private _positionParameter: CommandLineIntegerParameter;

  private static _actions: { [actionName: string]: IParameter[] } = {};

  public constructor(parser: RushCommandLineParser) {
    super({
      actionName: 'tab-complete',
      summary: 'Provides tab completion.',
      documentation: 'Provides tab completion',
      parser,
      safeForSimultaneousRushProcesses: true
    });
  }

  protected async run(): Promise<void> {
    this.parser.actions.forEach((element) => {
      const actionParameters: IParameter[] = [];
      element.parameters.forEach((elem) => {
        actionParameters.push({ name: elem.longName, kind: elem.kind });
        if (elem.shortName) {
          actionParameters.push({ name: elem.shortName, kind: elem.kind });
        }
      });
      TabCompleteAction._actions[element.actionName] = actionParameters;
    });

    TabCompleteAction._actions['-d'] = [];
    TabCompleteAction._actions['-debug'] = [];
    TabCompleteAction._actions['-h'] = [];
    TabCompleteAction._actions['-help'] = [];

    // console.log('arg count: ' + process.argv.length);

    // for (let i: number = 0; i < process.argv.length; i++) {
    //   console.log(i + ': ' + process.argv[i] + ' [' + process.argv[i].length + ']');
    // }

    if (!this._wordToCompleteParameter.value || !this._positionParameter.value) {
      this._printAllActions();
      return;
    }

    const commandLine: string = this._wordToCompleteParameter.value;
    const caretPosition: number = this._positionParameter.value;
    const commands: string[] = commandLine.split(' ');

    console.log('commandLine: ' + commandLine);
    console.log('commandLine.length: ' + commandLine.length);
    console.log('caretPosition: ' + caretPosition);
    console.log('commands.length: ' + commands.length);

    const debugParameterUsed: boolean =
      commands.length > 1 && (commands[1] === '-d' || commands[1] === '--debug');
    const debugParameterOffset: number = debugParameterUsed ? 1 : 0; // if debug switch is used, then offset everything by 1.

    if (commands.length < 2 + debugParameterOffset) {
      this._printAllActions();
    } else {
      const lastCommand: string = commands[commands.length - 1];
      if (caretPosition === commandLine.length) {
        if (commands.length === 2 + debugParameterOffset) {
          for (const actionName of Object.keys(TabCompleteAction._actions)) {
            if (actionName.indexOf(commands[1 + debugParameterOffset]) === 0) {
              console.log(actionName);
            }
          }
        } else {
          for (const actionName of Object.keys(TabCompleteAction._actions)) {
            if (actionName === commands[1 + debugParameterOffset]) {
              for (let i: number = 0; i < TabCompleteAction._actions[actionName].length; i++) {
                if (TabCompleteAction._actions[actionName][i].name.indexOf(lastCommand) === 0) {
                  console.log(TabCompleteAction._actions[actionName][i]);
                }
              }
            }
          }
        }
      } else {
        for (const actionName of Object.keys(TabCompleteAction._actions)) {
          if (actionName === commands[1 + debugParameterOffset]) {
            // TODO: Add support for -d/--debug switches
            if (actionName === 'build' || actionName === 'rebuild') {
              const projectCommands: string[] = ['-f', '--from', '-t', '--to'];
              console.log('lastCommandIndex: ' + projectCommands.indexOf(lastCommand));
              if (projectCommands.indexOf(lastCommand) !== -1) {
                for (let i: number = 0; i < this.rushConfiguration.projects.length; i++) {
                  console.log(this.rushConfiguration.projects[i].packageName);
                }

                return;
              }

              // TODO: Add support for version policy, variant
            } else if (actionName === 'change') {
              if (lastCommand === '--bump-type') {
                const bumpTypes: string[] = ['major', 'minor', 'patch', 'none'];
                for (let i: number = 0; i < bumpTypes.length; i++) {
                  console.log(bumpTypes[i]);
                }

                return;
              }
            } else if (actionName === 'publish') {
              if (lastCommand === '--set-access-level') {
                const accessLevels: string[] = ['public', 'restricted'];
                for (let i: number = 0; i < accessLevels.length; i++) {
                  console.log(accessLevels[i]);
                }

                return;
              }
            }

            for (let i: number = 0; i < TabCompleteAction._actions[actionName].length; i++) {
              if (
                lastCommand === TabCompleteAction._actions[actionName][i].name &&
                TabCompleteAction._actions[actionName][i].kind !== CommandLineParameterKind.Flag
              ) {
                return;
              }
            }

            for (let i: number = 0; i < TabCompleteAction._actions[actionName].length; i++) {
              console.log(TabCompleteAction._actions[actionName][i].name);
            }
          }
        }
      }
    }
  }

  private _printAllActions(): void {
    for (const actionName of Object.keys(TabCompleteAction._actions)) {
      console.log(actionName);
    }
  }

  protected onDefineParameters(): void {
    this._wordToCompleteParameter = this.defineStringParameter({
      parameterLongName: '--word',
      argumentName: 'WORD',
      description: `The word to complete.`
    });

    this._positionParameter = this.defineIntegerParameter({
      parameterLongName: '--position',
      argumentName: 'INDEX',
      description: `The position in the word to be completed.`
    });
  }
}