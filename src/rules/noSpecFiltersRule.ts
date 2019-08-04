/*
  "rules": {
    "no-spec-filters": {
      "options": [{
        "fileFilter": "spec"
      }],
      "severity": "error"
    }
  }
*/

import { tsquery } from '@phenomnomnominal/tsquery';
import { Replacement, RuleFailure, Rules, IOptions } from 'tslint';
import { SourceFile } from 'typescript';

const FDESCRIBE_FIT_QUERY = 'Identifier[escapedText=/^f(describe|it)$/]';
const FAILURE_MESSAGE = (filter: string) => `Remember to remove "${filter}" once you have finished working on tests.`;

export class Rule extends Rules.AbstractRule {

  protected ruleArguments: any;

  constructor(options: IOptions) {
    super(options);
    this.ruleArguments = this.getRuleArguments();
  }

  public apply(sourceFile: SourceFile): Array<RuleFailure> {
    if (this.checkForFileFilter(sourceFile)) {
      return [];
    }

    return tsquery(sourceFile, FDESCRIBE_FIT_QUERY).map((result: any) => {
      const replacement = new Replacement(result.getStart(), result.getWidth(), result.escapedText.replace(/^f/, ''));
      return new RuleFailure(
        result.getSourceFile(),
        result.getStart(),
        result.getEnd(),
        FAILURE_MESSAGE(result.escapedText as string),
        this.ruleName,
        replacement);
    });
  }

  public checkForFileFilter(sourceFile: SourceFile): boolean {
    return (this.ruleArguments.fileFilter && !sourceFile.fileName.includes(this.ruleArguments.fileFilter));
  }

  public getRuleArguments(): any {
    const options: IOptions = this.getOptions();
    const [ruleArguments]: any = options.ruleArguments;
    return ruleArguments;
  }
}
