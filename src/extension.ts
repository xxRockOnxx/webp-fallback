import * as vscode from 'vscode';
import createPicture from './create-picture';
import convertImg from './convert-img';

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('webp-fallback.create-picture-tag', () => {
    vscode.window.showInputBox({
      prompt: "Enter the original <img> src."
    })
    .then((value) => {
      if (value === undefined) {
        return;
      }

      createPicture(value);
    });
	});

  const disposable2 = vscode.commands.registerCommand('webp-fallback.convert-img-tag', () => {
    convertImg();
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(disposable2);
}

export function deactivate() {}
