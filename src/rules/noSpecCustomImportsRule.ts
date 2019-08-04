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
import { RuleFailure, Rules, IOptions } from 'tslint';
import { SourceFile, isIdentifier, isCallExpression } from 'typescript';

const TESTING_MODULE_IMPORTS_QUERY = 'CallExpression[expression.name.escapedText="configureTestingModule"]';
const ANGULAR_IMPORTS_QUERY = 'ImportDeclaration[moduleSpecifier.text=/^@angular.*/]';
const FAILURE_MESSAGE = (filter: string) => `Don't use "${filter}" in TestBed Testing Module imports.`;

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

  public elementAllowed(element, sourceFile: SourceFile): boolean {
    const allAllowed: string[] = [...this.ruleArguments.allowed || [], ...this.getAngularModulesNames(sourceFile)] || [];
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

  public getAngularModulesNames(sourceFile: SourceFile): string[] {
    if (this.ruleArguments.allowAngularModules) {
      const results: any = tsquery(sourceFile, ANGULAR_IMPORTS_QUERY);
      return results.reduce((accumulator: string[], importDeclaration) => {
        accumulator.push(...importDeclaration.importClause.namedBindings.elements.map((element) => element.name.escapedText));
        return accumulator;
      }, []);
    }
    return [];
  }

  public generateRuleFailures(sourceFile: SourceFile) {
    const results: any = tsquery(sourceFile, TESTING_MODULE_IMPORTS_QUERY);

    if (results[0]) {
      const result: any = results[0];
      if (result.arguments[0]) {
        const argument: any = result.arguments[0];
        const properties: any = argument.properties;
        const importProperty = properties.find(property => property.name.escapedText === 'imports');
        if (importProperty) {
          const initializer = importProperty.initializer;
          return initializer.elements
            .filter(element => !this.elementAllowed(element, sourceFile))
            .map(element => {
              return new RuleFailure(
                result.getSourceFile(),
                element.getStart(),
                element.getEnd(),
                FAILURE_MESSAGE(this.getElementName(element)),
                this.ruleName);
            });
        }
      }
    }

    return [];
  }

}
