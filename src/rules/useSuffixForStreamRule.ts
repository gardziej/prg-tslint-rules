/*
  "rules": {
    "no-spec-filters": {
      "options": [{
        "suffix": "$"
      }],
      "severity": "error"
    }
  }
*/

import { tsquery } from '@phenomnomnominal/tsquery';
import { Replacement, RuleFailure, Rules, IOptions } from 'tslint';
import { SourceFile, Program, TypeChecker, Type } from 'typescript';
import { couldBeType } from 'tsutils-etc';

const FDESCRIBE_FIT_QUERY: string = 'VariableDeclaration > Identifier';
const FAILURE_MESSAGE: (_: string) => string = (filter: string): string => `Use "${filter}" suffix for stream variable name`;

const streamTypes: string[] = ['Observable', 'Subject', 'BehaviorSubject', 'ReplaySubject'];

export class Rule extends Rules.TypedRule {

  protected ruleArguments: any;

  constructor(options: IOptions) {
    super(options);
    this.ruleArguments = this.getRuleArguments();
  }

  public applyWithProgram(sourceFile: SourceFile, program: Program): RuleFailure[] {
    if (this.checkForFileFilter(sourceFile)) {
      return [];
    }

    const typeChecker: TypeChecker = program.getTypeChecker();

    return tsquery(sourceFile, FDESCRIBE_FIT_QUERY)
      .filter((result: any) => {
        const type: Type = typeChecker.getTypeAtLocation(result);
        return (result.escapedText.slice(-1) !== this.ruleArguments.suffix &&
          streamTypes.some((streamType: string) => couldBeType(type, streamType)));
      })
      .map((result: any) => {
        const replacement: Replacement = new Replacement(
          result.getStart(),
          result.getWidth(),
          result.escapedText + this.ruleArguments.suffix
          );
        return new RuleFailure(
          result.getSourceFile(),
          result.getStart(),
          result.getEnd(),
          FAILURE_MESSAGE(this.ruleArguments.suffix as string),
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
