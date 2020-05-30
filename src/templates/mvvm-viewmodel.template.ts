import * as changeCase from 'change-case';

export function getMvvmViewModelTemplate(name: string): string {
	return getDefaultMvvmViewModelTemplate(name);
}

function getDefaultMvvmViewModelTemplate(name: string): string {
	const pascalCaseName = changeCase.pascalCase(name.toLowerCase());
	return `import 'package:stacked/stacked.dart';
    
    class ${pascalCaseName}ViewModel extends BaseViewModel {}`;
}
