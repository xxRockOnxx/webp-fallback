import * as vscode from 'vscode';
import parse, { MatchedTag } from '@emmetio/html-matcher';

export default function() {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    vscode.window.showInformationMessage('No editor is active');
    return;
  }

  const replacements: [vscode.Range, string][] = [];

  editor.selections.forEach((selection) => {
    const tag = parse(editor.document.getText(), editor.document.offsetAt(selection.start));

    if (!tag || tag.name !== "img") {
      return;
    }

    const replacementRange = new vscode.Range(
      editor.document.positionAt(tag.open[0]),
      editor.document.positionAt(tag.open[1]),
    );

    const replacementText = createReplacementText(editor, tag);

    replacements.push([replacementRange, replacementText]);
  });

  editor.edit((edit) => {
    replacements.forEach(([range, text]) => {
      edit.replace(range, text);
    });
  });
}

function createReplacementText(editor: vscode.TextEditor, tag: MatchedTag) {
  const spacingCount = editor.document.positionAt(tag.open[0]).character + (editor.options.tabSize as number);
  const spacingCharacter = editor.options.insertSpaces ? " " : "\t";

  const webpSource = tag.attributes.reduce((text, attribute) => {
    if (attribute.name !== "src") {
      return text;
    }

    if (!attribute.value) {
      return text;
    }

    // Remove quotes to get actual src
    const src = attribute.value.replace(/"/g, "");
    const extension = src.split(".").pop();

    if (!extension) {
      return src;
    }

    return src.replace(extension, "webp");
  }, "");

  const sourceText = `<source srcset="${webpSource}" type="image/webp">`;
  const imageText = createImageText(tag);

  let text = "<picture>\n";

  text += sourceText.padStart(sourceText.length + spacingCount, spacingCharacter);
  text += "\n";
  text += imageText.padStart(imageText.length + spacingCount, spacingCharacter);
  text += "\n";
  text += "</picture>".padStart(10 + editor.document.positionAt(tag.open[0]).character, spacingCharacter);

  return text;
}

function createImageText(tag: MatchedTag) {
  let text = "<img";

  for (const attribute of tag.attributes) {
    text += ` ${attribute.name}=${attribute.value}`;
  }

  text += ">";

  return text;
}
