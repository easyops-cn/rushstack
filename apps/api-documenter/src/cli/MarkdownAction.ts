// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.

import { ApiDocumenterCommandLine } from './ApiDocumenterCommandLine';
import { BaseAction } from './BaseAction';
import { MarkdownDocumenter } from '../documenters/MarkdownDocumenter';
import { ApiModel } from '@microsoft/api-extractor-model';
import { CommandLineFlagParameter } from '@rushstack/ts-command-line';

export class MarkdownAction extends BaseAction {
  private _frontMatterParameter: CommandLineFlagParameter;

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
  }

  protected onExecute(): Promise<void> {
    // override
    const apiModel: ApiModel = this.buildApiModel();

    const markdownDocumenter: MarkdownDocumenter = new MarkdownDocumenter(
      apiModel,
      undefined,
      this._frontMatterParameter.value
    );
    markdownDocumenter.generateFiles(this.outputFolder);
    return Promise.resolve();
  }
}
