/*
  "rules": {
    "use-spec-mocked-providers": {
      "options": [{
        "fileFilter": "spec",
        "allowed": [
          "AllowedService"
        ]
      }]
    }
  }
*/

import { tsquery } from '@phenomnomnominal/tsquery';
import { RuleFailure, Rules, IOptions } from 'tslint';
import { SourceFile, isIdentifier, isCallExpression } from 'typescript';

// tslint:disable-next-line:max-line-length
const TESTING_MODULE_PROVIDERS_QUERY = `CallExpression[expression.name.escapedText="configureTestingModule"] PropertyAssignment > Identifier[name="providers"]  ~ ArrayLiteralExpression > Identifier`;
const FAILURE_MESSAGE = (filter: string) => `Don't use "${filter}" in TestBed Testing Module providers, use mock instead.`;

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
    return this.generateRuleFailures(sourceFile);
  }

  public checkForFileFilter(sourceFile: SourceFile): boolean {
    return (this.ruleArguments.fileFilter && !sourceFile.fileName.includes(this.ruleArguments.fileFilter));
  }

  public getRuleArguments(): any {
    const options: IOptions = this.getOptions();
    const [ruleArguments]: any = options.ruleArguments;
    return ruleArguments;
  }

  public elementAllowed(element): boolean {
    const allAllowed: string[] = [...this.ruleArguments.allowed || []];
    return allAllowed.includes(this.getElementName(element));
  }

  public getElementName(element) {
    if (isIdentifier(element)) {
      return element.escapedText;
    }
    else if (isCallExpression(element)) {
      return (element.expression as any).expression.escapedText;
    }
  }

  public generateRuleFailures(sourceFile: SourceFile) {
    return tsquery(sourceFile, TESTING_MODULE_PROVIDERS_QUERY)
      .filter((result: any) => result.escapedText && result.escapedText !== this.fileToClassName(sourceFile.fileName))
      .filter((result: any) => !this.elementAllowed(result)
      )
      .map((result: any) => {
        return new RuleFailure(
          result.getSourceFile(),
          result.getStart(),
          result.getEnd(),
          FAILURE_MESSAGE(result.escapedText as string),
          this.ruleName);
      });

  }

  public fileToClassName(fileName: string): string {
    const className = fileName
      .split('/')
      .pop()
      .replace('.spec.ts', '')
      .replace(
        /([-_.][a-z])/g,
        (group: string) => group.toUpperCase()
          .replace('-', '')
          .replace('.', '')
      );
    return className.charAt(0).toUpperCase() + className.slice(1);
  }

}

