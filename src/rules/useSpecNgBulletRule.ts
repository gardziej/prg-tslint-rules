/*
  "rules": {
    "use-spec-ng-bullet": {
      "options": [{
        "fileFilter": "spec"
      }]
    }
  }
*/

import { tsquery } from '@phenomnomnominal/tsquery';
import { Replacement, RuleFailure, Rules, IOptions } from 'tslint';
import { SourceFile, Identifier } from 'typescript';

const FDESCRIBE_FIT_QUERY = 'Identifier[escapedText="configureTestingModule"]';
const FAILURE_MESSAGE = (filter: string) => `Don't configure Testing Module in beforeEach, use ng-bullet`;

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

    return tsquery(sourceFile, FDESCRIBE_FIT_QUERY).reduce((ruleFailures: RuleFailure[], result: any) => {
      if (this.isParentBeforeEach(result.parent)) {
        ruleFailures.push(new RuleFailure(
          result.getSourceFile(),
          result.getStart(),
          result.getEnd(),
          FAILURE_MESSAGE(result.escapedText as string),
          this.ruleName));
      }
      return ruleFailures;
    }, []);
  }

  private isParentBeforeEach(element: any): boolean {
    if (element.expression && element.expression.escapedText) {
    }
    if (element.expression && element.expression.escapedText && element.expression.escapedText === 'beforeEach') {
      return true;
    }
    else if (element.parent) {
      return this.isParentBeforeEach(element.parent);
    }
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
