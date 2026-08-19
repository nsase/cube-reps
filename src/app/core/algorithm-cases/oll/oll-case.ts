import { AlgorithmCase, CubePattern } from '../../cube.models';

interface OllCaseDefinition {
  number: string;
  names: readonly string[];
  group: string;
  algorithms: readonly string[];
  pattern: CubePattern;
}

export function defineOllCase(definition: OllCaseDefinition): AlgorithmCase {
  return {
    kind: 'OLL',
    number: definition.number,
    name: definition.names[0] ?? `OLL ${Number(definition.number)}`,
    aliases: definition.names,
    group: definition.group,
    algorithms: definition.algorithms,
    pattern: definition.pattern,
  };
}
