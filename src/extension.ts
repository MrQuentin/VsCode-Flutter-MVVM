import * as _ from 'lodash';
import * as changeCase from 'change-case';
import { commands, ExtensionContext, InputBoxOptions, OpenDialogOptions, QuickPickOptions, Uri, window } from 'vscode';
import { lstatSync, exists, existsSync, writeFile, fstat, mkdir } from 'fs';
import { getMvvmViewTemplate, getMvvmViewModelTemplate } from './templates';

export function activate(context: ExtensionContext) {
	// analyzeDependencies();

	let disposable = commands.registerCommand('extension.new-mvvm', async (uri: Uri) => {
		const name = await promptForName();
		if (_.isNil(name) || name.trim() === '') {
			window.showErrorMessage('The name must not be empty');
			return;
		}

		let targetDirectory;
		if (_.isNil(_.get(uri, 'fsPath')) || !lstatSync(uri.fsPath).isDirectory()) {
			targetDirectory = await promptForTargetDirectory();
			if (_.isNil(targetDirectory)) {
				window.showErrorMessage('Please select a valid directory');
				return;
			}
		} else {
			targetDirectory = uri.fsPath;
		}

		const isReactive = (await promptForIsReactive()) === 'yes (default)';

		const pascalCaseName = changeCase.pascalCase(name.toLocaleLowerCase());

		try {
			await generateMvvmCode(name, targetDirectory, isReactive);
			window.showInformationMessage(`Successfully Generated ${pascalCaseName} View`);
		} catch (error) {
			window.showErrorMessage(`Error: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
		}
	});

	context.subscriptions.push(disposable);
}

function promptForName(): Thenable<string | undefined> {
	const namePromptOptions: InputBoxOptions = {
		prompt: 'View Name',
		placeHolder: 'name'
	};
	return window.showInputBox(namePromptOptions);
}

function promptForIsReactive(): Thenable<string | undefined> {
	const isReactivePromptValues: string[] = [ 'yes (default)', 'no' ];
	const isReactivePromptOptions: QuickPickOptions = {
		placeHolder: 'Do you want your view to be reactive to changes ?',
		canPickMany: false
	};
	return window.showQuickPick(isReactivePromptValues, isReactivePromptOptions);
}

async function promptForTargetDirectory(): Promise<string | undefined> {
	const options: OpenDialogOptions = {
		canSelectMany: false,
		openLabel: 'Select a folder to create the bloc in',
		canSelectFolders: true
	};

	return window.showOpenDialog(options).then((uri) => {
		if (_.isNil(uri) || _.isEmpty(uri)) {
			return undefined;
		}
		return uri[0].fsPath;
	});
}

async function generateMvvmCode(name: string, targetDirectory: string, isReactive: boolean) {
	const snakeCaseName = changeCase.snakeCase(name.toLowerCase());
	const directoryPath = `${targetDirectory}/${snakeCaseName}`;
	if (!existsSync(directoryPath)) {
		await createDirectory(directoryPath);
	}
	await Promise.all([
		createViewTemplate(name, directoryPath, isReactive),
		createViewModelTemplate(name, directoryPath),
		createWidgetsFolder(directoryPath)
	]);
}

function createDirectory(targetDirectory: string): Promise<void> {
	return new Promise((resolve, reject) => {
		mkdir(targetDirectory, (error) => {
			if (error) {
				return reject(error);
			}
			resolve();
		});
	});
}

function createViewTemplate(name: string, directoryPath: string, isReactive: boolean) {
	const snakeCaseName = changeCase.snakeCase(name.toLowerCase());
	const targetPath = `${directoryPath}/${snakeCaseName}_view.dart`;
	if (existsSync(targetPath)) {
		throw Error(`${snakeCaseName}_view.dart already exists`);
	}
	return new Promise(async (resolve, reject) => {
		writeFile(targetPath, getMvvmViewTemplate(name, isReactive), 'utf8', (error) => {
			if (error) {
				reject(error);
				return;
			}
			resolve();
		});
	});
}

function createViewModelTemplate(name: string, directoryPath: string) {
	const snakeCaseName = changeCase.snakeCase(name.toLowerCase());
	const targetPath = `${directoryPath}/${snakeCaseName}_viewmodel.dart`;
	if (existsSync(targetPath)) {
		throw Error(`${snakeCaseName}_viewmodel.dart already exists`);
	}
	return new Promise(async (resolve, reject) => {
		writeFile(targetPath, getMvvmViewModelTemplate(name), 'utf8', (error) => {
			if (error) {
				reject(error);
				return;
			}
			resolve();
		});
	});
}

function createWidgetsFolder(directoryPath: string) {
	const targetPath = `${directoryPath}/widgets`;
	if (existsSync(targetPath)) {
		throw Error(`widgets directory already exists`);
	}
	return new Promise(async (resolve, reject) => {
		createDirectory(targetPath);
	});
}
