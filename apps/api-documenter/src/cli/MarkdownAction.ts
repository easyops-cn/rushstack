// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.

import { ApiDocumenterCommandLine } from './ApiDocumenterCommandLine';
import { BaseAction } from './BaseAction';
import { MarkdownDocumenter } from '../documenters/MarkdownDocumenter';
import { CommandLineFlagParameter, CommandLineStringParameter } from '@rushstack/ts-command-line';

export class MarkdownAction extends BaseAction {
  private _frontMatterParameter!: CommandLineFlagParameter;
  private _breadcrumbHomeParameter!: CommandLineStringParameter;

  public constructor(parser: ApiDocumenterCommandLine) {
    super({
      actionName: 'markdown',
      summary: 'Generate documentation as Markdown files (*.md)',
      documentation:
        'Generates API documentation as a collection of files in' +
        ' Markdown format, suitable for example for publishing on a GitHub site.'
    });
  }

  protected onDefineParameters(): void {
    // override
    super.onDefineParameters();

    this._frontMatterParameter = this.defineFlagParameter({
      parameterLongName: '--front-matter',
      description: `Enables front matter in markdown`
    });

    this._breadcrumbHomeParameter = this.defineStringParameter({
      parameterLongName: '--breadcrumb-home',
      argumentName: 'HOME',
      description: `Specifies the breadcrumb home display name.` + ` If omitted, the default is "Home"`
    });
  }

  protected onExecute(): Promise<void> {
    // override
    const { apiModel, outputFolder } = this.buildApiModel();

    const markdownDocumenter: MarkdownDocumenter = new MarkdownDocumenter({
      apiModel,
      documenterConfig: undefined,
      outputFolder,
      enableFrontMatter: this._frontMatterParameter.value,
      breadcrumbHome: this._breadcrumbHomeParameter.value
    });
    markdownDocumenter.generateFiles();
    return Promise.resolve();
  }
}
