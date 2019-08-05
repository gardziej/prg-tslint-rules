/*
  "rules": {
    "no-spec-custom-imports": {
      "options": [{
        "fileFilter": "spec",
        "allowAngularModules": true,
        "allowed": [
          "AppRoutingModule"
        ]
      }]
    }
  }
*/

import { tsquery } from '@phenomnomnominal/tsquery';
import { RuleFailure, Rules, IOptions, Replacement } from 'tslint';
import {
  SourceFile,
  isIdentifier,
  isCallExpression,
  Node,
  ImportDeclaration,
  ImportSpecifier,
  NamedImports,
  Identifier,
  CallExpression
} from 'typescript';

// tslint:disable-next-line:max-line-length
const TESTING_MODULE_IMPORTS_QUERY: string = 'CallExpression[expression.name.escapedText="configureTestingModule"] ObjectLiteralExpression PropertyAssignment[name.escapedText="imports"]  ArrayLiteralExpression > *';
const ANGULAR_IMPORTS_QUERY: string = 'ImportDeclaration[moduleSpecifier.text=/^@angular.*/]';
const FAILURE_MESSAGE: (_: string) => string = (filter: string): string => `Don't use "${filter}" in TestBed Testing Module imports.`;

export class Rule extends Rules.AbstractRule {

  protected ruleArguments: any;

  constructor(options: IOptions) {
    super(options);
    this.ruleArguments = this.getRuleArguments();
  }

  public apply(sourceFile: SourceFile): RuleFailure[] {
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

  public elementAllowed(element: Node, sourceFile: SourceFile): boolean {
    const allAllowed: string[] = [...this.ruleArguments.allowed || [], ...this.getAngularModulesNames(sourceFile)] || [];
    return allAllowed.includes(this.getElementName(element));
  }

  public getElementName(element: any): string {
    if (element.escapedText) {
      return element.escapedText as string;
    }
    else if (element.expression && element.expression.expression) {
      return element.expression.expression.escapedText as string;
    }
  }

  public getAngularModulesNames(sourceFile: SourceFile): string[] {
    if (this.ruleArguments.allowAngularModules) {
      const results: any = tsquery(sourceFile, ANGULAR_IMPORTS_QUERY);
      return results.reduce((accumulator: string[], importDeclaration: ImportDeclaration) => {
        const namedBindings: NamedImports = importDeclaration.importClause.namedBindings as NamedImports;
        accumulator.push(...namedBindings.elements
          .map((element: ImportSpecifier) => element.name.escapedText as string));
        return accumulator;
      }, []);
    }
    return [];
  }

  public generateRuleFailures(sourceFile: SourceFile): RuleFailure[] {
    const imports: Node[] = tsquery(sourceFile, TESTING_MODULE_IMPORTS_QUERY);
    return imports
      .filter((result: Node) => !this.elementAllowed(result, sourceFile))
      .map((result: Node) => {
        return new RuleFailure(
          result.getSourceFile(),
          result.getStart(),
          result.getEnd(),
          FAILURE_MESSAGE(this.getElementName(result)),
          this.ruleName);
      });
  }

}
