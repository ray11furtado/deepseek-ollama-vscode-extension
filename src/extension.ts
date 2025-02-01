// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Ollama} from 'ollama';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "deepseek-ai-vscode" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('deepseek-ai-vscode.chat', () => {
		vscode.window.showInformationMessage('Hello World from deepseek-ai-vscode!');

		const panel = vscode.window.createWebviewPanel(
			'deepChat',
			'Deep Seek Chat',
			vscode.ViewColumn.One,
			{ enableScripts: true }
		)

		panel.webview.html = getWebviewContent()

		panel.webview.onDidReceiveMessage(async (message) => {
			const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });
			if (message.command === 'ask') {
				const userPrompt = message.message;
				let responseText = '';
				try {
					const streamResponse = await ollama.chat({
						model: 'deepseek-r1:1.5b',
						messages: [{ role: 'user', content: userPrompt }],
						stream: true,
					});

					console.log('hello', userPrompt)

					for await (const chunk of streamResponse) {
						console.log(chunk)
						responseText += chunk.message.content
						panel.webview.postMessage({ command: 'chatResponse', text: responseText });
					}
				} catch (error) {
					console.error('Error during chat:', error);
				}
			}
		});
	});

	context.subscriptions.push(disposable);

}

function getWebviewContent(): string {
	return /*html*/ `
		<!DOCTYPE html>
		<html lang="en">
		<head>
		<style>
			.chat-container {
				display: flex;
				flex-direction: column;
				height: 100%;
				padding: 10px;
			}

			.chat-output {
				flex: 1;
				margin-bottom: 10px;
				padding: 10px;
				overflow-y: auto;
				background-color: var(--vscode-editor-background);
				border: 1px solid var(--vscode-widget-border);
			}

			.input-container {
				display: flex;
				gap: 8px;
			}

			.input {
				flex: 1;
				padding: 8px;
				background-color: var(--vscode-input-background);
				border: 1px solid var(--vscode-input-border);
				color: var(--vscode-input-foreground);
				resize: none;
			}

			.monaco-button {
				padding: 4px 12px;
				color: var(--vscode-button-foreground);
				background-color: var(--vscode-button-background);
				border: none;
				cursor: pointer;
			}

			.monaco-button:hover {
				background-color: var(--vscode-button-hoverBackground);
			}
		</style>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Deep Seek Chat</title>
		</head>
		<body>
			<h1>Deep Seek Chat VSCode Extension</h1>

    
			<div class="chat-container">
				<div class="input-container">
					<textarea 
						id="chat-input" 
						class="input" 
						placeholder="Type your message here..."
					></textarea>
					<button id="send-button" class="monaco-button">Send</button>
					<div id="chat-output" class="chat-output"></div>

				</div>
			</div>
			<script>
				const vscode = acquireVsCodeApi()
				const askButton = document.getElementById('send-button')
				const chatInput = document.getElementById('chat-input')
				const chatOutput = document.getElementById('chat-output')

				askButton.addEventListener('click', () => {
					const message = chatInput.value
					vscode.postMessage({ command: 'ask', message })
					chatInput.innerHTML = ''
				})

				window.addEventListener('message', (event) => {
					const message = event.data
					if (message.command === 'chatResponse') {
						chatOutput.innerHTML = message.text
					}
				})

			</script>
		</body>
		</html>
	`;
}



// This method is called when your extension is deactivated
export function deactivate() {}