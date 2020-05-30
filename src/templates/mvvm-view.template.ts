import * as changeCase from 'change-case';

export function getMvvmViewTemplate(name: string, isReactive: boolean): string {
	return isReactive ? getReactiveMvvmViewTemplate(name) : getNonReactiveMvvmViewTemplate(name);
}

function getReactiveMvvmViewTemplate(name: string): string {
	const pascalCaseName = changeCase.pascalCase(name.toLowerCase());
	const snakeCaseName = changeCase.snakeCase(name.toLowerCase());
	return `import 'package:flutter/material.dart';
	import 'package:stacked/stacked.dart';
	import './${snakeCaseName}_viewmodel.dart';
    
    class ${pascalCaseName}View extends StatelessWidget {
		@override
		Widget build(BuildContext context) {
			return ViewModelBuilder<${pascalCaseName}ViewModel>.reactive(
			builder: (context, model, child) => Scaffold(),
			viewModelBuilder: () => ${pascalCaseName}ViewModel(),
			);
		}
	}`;
}

function getNonReactiveMvvmViewTemplate(name: string): string {
	const pascalCaseName = changeCase.pascalCase(name.toLowerCase());
	const snakeCaseName = changeCase.snakeCase(name.toLowerCase());
	return `import 'package:flutter/material.dart';
	import 'package:stacked/stacked.dart';
	import './${snakeCaseName}_viewmodel.dart';
    
    class ${pascalCaseName}View extends StatelessWidget {
		@override
		Widget build(BuildContext context) {
			return ViewModelBuilder<${pascalCaseName}ViewModel>.nonReactive(
			builder: (context, model, child) => Scaffold(),
			viewModelBuilder: () => ${pascalCaseName}ViewModel(),
			);
		}
	}`;
}
