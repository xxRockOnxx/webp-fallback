import * as vscode from 'vscode';

export default function(src: string) {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    vscode.window.showInformationMessage('No editor is active');
    return;
  }

  if (src.trim().length === 0) {
    editor.insertSnippet(new vscode.SnippetString(createSnippetText(editor)));
    return;
  }

  editor.edit((edit) => {
    edit.insert(editor.selection.start, createReplacementText(editor, src));
  });
}

function createSnippetText(editor: vscode.TextEditor) {
  const spacingCount = (editor.options.tabSize as number);
  const spacingCharacter = editor.options.insertSpaces ? " " : "\t";

  console.log(spacingCount);

  const sourceText = `<source srcset="$1" type="image/webp">`;
  const imageText = `<img src="$2" type="$3">`;

  let text = "<picture>\n";

  text += sourceText.padStart(sourceText.length + spacingCount, spacingCharacter);
  text += "\n";
  text += imageText.padStart(imageText.length + spacingCount, spacingCharacter);
  text += "\n";
  text += "</picture>";

  return text;
}

function createReplacementText(editor: vscode.TextEditor, src: string) {
  const spacingCount = editor.selection.start.character + (editor.options.tabSize as number);
  const spacingCharacter = editor.options.insertSpaces ? " " : "\t";

  const webpSource = convertSrcToWebp(src);
  const sourceText = `<source srcset="${webpSource}" type="image/webp">`;
  const imageText = createImageText(src);

  let text = "<picture>\n";

  text += sourceText.padStart(sourceText.length + spacingCount, spacingCharacter);
  text += "\n";
  text += imageText.padStart(imageText.length + spacingCount, spacingCharacter);
  text += "\n";
  text += "</picture>".padStart(10 + editor.selection.start.character, spacingCharacter);

  return text;
}

function createImageText(src: string) {
  let text = `<img src="${src}"`;

  const extension = src.includes(".")
    ? src.split(".").pop()
    : null;

  if (extension) {
    text += `type="image/${extension}"`;
  }

  text += ">";

  return text;
}

function convertSrcToWebp(src: string) {
  const extension = src.includes(".")
    ? src.split(".").pop()
    : null;

   return extension
     ? src.replace(extension, "webp")
     : "";
}
