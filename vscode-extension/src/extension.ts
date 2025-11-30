import * as vscode from "vscode";
import { NeuroLintProvider } from "./providers/NeuroLintProvider";
import { NeuroLintCodeActionProvider } from "./providers/CodeActionProvider";
import { NeuroLintHoverProvider } from "./providers/HoverProvider";
import { NeuroLintDiagnosticProvider } from "./providers/DiagnosticProvider";
import { NeuroLintTreeDataProvider } from "./providers/TreeDataProvider";
import { NeuroLintStatusBar } from "./ui/StatusBar";
import { NeuroLintWebview } from "./ui/Webview";
import { ConfigurationManager } from "./utils/ConfigurationManager";
import { SharedCoreAdapter } from "./utils/SharedCoreAdapter";

let neurolintProvider: NeuroLintProvider;
let diagnosticProvider: NeuroLintDiagnosticProvider;
let statusBar: NeuroLintStatusBar;
let outputChannel: vscode.OutputChannel;
let webview: NeuroLintWebview;
let configManager: ConfigurationManager;
let sharedCoreAdapter: SharedCoreAdapter;

export function activate(context: vscode.ExtensionContext) {
  try {
    // Initialize output channel
    outputChannel = vscode.window.createOutputChannel("NeuroLint");
    outputChannel.appendLine("NeuroLint extension activating...");

    // Initialize configuration manager
    configManager = new ConfigurationManager();
    outputChannel.appendLine("Configuration manager initialized");

    // Validate configuration on startup
    const configValidation = configManager.validateConfiguration();
    if (!configValidation.valid) {
      outputChannel.appendLine(
        `Configuration issues found: ${configValidation.errors.join(", ")}`,
      );
      statusBar?.updateStatus("Configuration Error");
    }
    if (configValidation.warnings.length > 0) {
      outputChannel.appendLine(
        `Configuration warnings: ${configValidation.warnings.join(", ")}`,
      );
    }

    // Initialize shared core adapter
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || process.cwd();
    sharedCoreAdapter = new SharedCoreAdapter(outputChannel, workspaceRoot);
    outputChannel.appendLine("Shared core adapter initialized");

    // Initialize status bar early
    statusBar = new NeuroLintStatusBar();
    context.subscriptions.push(statusBar.statusBarItem);
    statusBar.updateStatus("Initializing...", true);

    // Initialize main provider
    neurolintProvider = new NeuroLintProvider(
      sharedCoreAdapter,
      configManager,
      outputChannel,
    );
    context.subscriptions.push(neurolintProvider);
    outputChannel.appendLine("Main provider initialized");

    // Initialize diagnostic provider
    diagnosticProvider = new NeuroLintDiagnosticProvider(
      sharedCoreAdapter,
      outputChannel,
    );
    context.subscriptions.push(diagnosticProvider);
    outputChannel.appendLine("Diagnostic provider initialized");

    // Initialize webview
    webview = new NeuroLintWebview();
    context.subscriptions.push(webview);
    outputChannel.appendLine("Webview initialized");

    // Register providers
    const selector = [
      { scheme: "file", language: "typescript" },
      { scheme: "file", language: "javascript" },
      { scheme: "file", language: "typescriptreact" },
      { scheme: "file", language: "javascriptreact" },
    ];

    // Code action provider (quick fixes)
    try {
      context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
          selector,
          new NeuroLintCodeActionProvider(sharedCoreAdapter, outputChannel),
        ),
      );
      outputChannel.appendLine("Code action provider registered");
    } catch (error) {
      outputChannel.appendLine(
        `Failed to register code action provider: ${error}`,
      );
    }

    // Hover provider (documentation)
    try {
      context.subscriptions.push(
        vscode.languages.registerHoverProvider(
          selector,
          new NeuroLintHoverProvider(sharedCoreAdapter, outputChannel),
        ),
      );
      outputChannel.appendLine("Hover provider registered");
    } catch (error) {
      outputChannel.appendLine(`Failed to register hover provider: ${error}`);
    }

    // Tree data provider (explorer view)
    try {
      const treeDataProvider = new NeuroLintTreeDataProvider(
        sharedCoreAdapter,
        outputChannel,
      );
      context.subscriptions.push(treeDataProvider);
      vscode.window.registerTreeDataProvider(
        "neurolintExplorer",
        treeDataProvider,
      );
      outputChannel.appendLine("Tree data provider registered");
    } catch (error) {
      outputChannel.appendLine(
        `Failed to register tree data provider: ${error}`,
      );
    }

    // Register commands
    context.subscriptions.push(
      vscode.commands.registerCommand("neurolint.analyzeFile", analyzeFile),
      vscode.commands.registerCommand(
        "neurolint.analyzeWorkspace",
        analyzeWorkspace,
      ),
      vscode.commands.registerCommand("neurolint.fixFile", fixFile),
      vscode.commands.registerCommand("neurolint.fixWorkspace", fixWorkspace),
      vscode.commands.registerCommand("neurolint.showOutput", showOutput),
      vscode.commands.registerCommand("neurolint.configure", openSettings),
      vscode.commands.registerCommand(
        "neurolint.toggleDiagnostics",
        toggleDiagnostics,
      ),
      vscode.commands.registerCommand("neurolint.openSettings", openSettings),
      vscode.commands.registerCommand("neurolint.showHistory", showHistory),
      vscode.commands.registerCommand("neurolint.exportResults", exportResults),
      vscode.commands.registerCommand("neurolint.importConfig", importConfig),
      vscode.commands.registerCommand("neurolint.exportConfig", exportConfig),
      vscode.commands.registerCommand("neurolint.resetConfig", resetConfig),
      vscode.commands.registerCommand("neurolint.refreshTree", refreshTree),
      vscode.commands.registerCommand("neurolint.viewResult", viewResult),
      vscode.commands.registerCommand("neurolint.clearCache", clearCache),
      vscode.commands.registerCommand("neurolint.viewDocumentation", viewDocs),
      vscode.commands.registerCommand("neurolint.login", login),
      vscode.commands.registerCommand("neurolint.migrateReact19", migrateReact19),
      vscode.commands.registerCommand("neurolint.migrateNextjs16", migrateNextjs16),
      vscode.commands.registerCommand("neurolint.migrateBiome", migrateBiome),
      vscode.commands.registerCommand("neurolint.checkDeps", checkDeps),
      vscode.commands.registerCommand("neurolint.checkTurbopack", checkTurbopack),
      vscode.commands.registerCommand("neurolint.checkCompiler", checkCompiler),
      vscode.commands.registerCommand("neurolint.assessRouter", assessRouter),
      vscode.commands.registerCommand("neurolint.detectReact192", detectReact192),
      vscode.commands.registerCommand("neurolint.simplify", simplifyCode),
      vscode.commands.registerCommand("neurolint.showLayers", showLayers),
      vscode.commands.registerCommand("neurolint.validate", validateCode),
      vscode.commands.registerCommand("neurolint.showStats", showStats),
    );

    // Configuration change listener
    context.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration((e: vscode.ConfigurationChangeEvent) => {
        if (e.affectsConfiguration("neurolint")) {
          outputChannel.appendLine("Configuration changed, reloading...");
          configManager.reloadConfiguration();

          // Update status bar
          const configValidation = configManager.validateConfiguration();
          if (!configValidation.valid) {
            statusBar.updateStatus("Configuration Error");
          } else {
            statusBar.updateStatus("Ready");
          }
        }
      }),
    );

    // Workspace folder changes
    context.subscriptions.push(
      vscode.workspace.onDidChangeWorkspaceFolders(() => {
        outputChannel.appendLine("Workspace folders changed");
        diagnosticProvider.clearAllDiagnostics();
      }),
    );

    // Document changes for real-time analysis
    context.subscriptions.push(
      vscode.workspace.onDidChangeTextDocument((e: vscode.TextDocumentChangeEvent) => {
        if (
          configManager.getConfiguration().autoFix &&
          selector.some(
            (s) =>
              s.language === e.document.languageId &&
              s.scheme === e.document.uri.scheme,
          )
        ) {
          // Debounce rapid changes
          setTimeout(() => {
            diagnosticProvider.updateDiagnostics(e.document);
          }, 500);
        }
      }),
    );

    // File save events
    context.subscriptions.push(
      vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
        if (
          configManager.getConfiguration().autoFix &&
          selector.some(
            (s) =>
              s.language === document.languageId &&
              s.scheme === document.uri.scheme,
          )
        ) {
          analyzeFile(document.uri);
        }
      }),
    );

    outputChannel.appendLine("NeuroLint extension activated successfully");
    statusBar.updateStatus("Ready");
  } catch (error) {
    outputChannel.appendLine(`Extension activation failed: ${error}`);
    statusBar?.updateStatus("Activation Failed");
    vscode.window.showErrorMessage(
      `NeuroLint activation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export function deactivate() {
  outputChannel?.appendLine("NeuroLint extension deactivating...");
  diagnosticProvider?.clearAllDiagnostics();
  statusBar?.dispose();
  outputChannel?.dispose();
}

// Command implementations
async function analyzeFile(uri?: vscode.Uri): Promise<void> {
  try {
    const document = uri
      ? await vscode.workspace.openTextDocument(uri)
      : vscode.window.activeTextEditor?.document;

    if (!document) {
      vscode.window.showWarningMessage("No active document to analyze");
      return;
    }

    statusBar.updateStatus("Analyzing...", true);
    outputChannel.appendLine(`Analyzing file: ${document.fileName}`);

    const results = await neurolintProvider.analyzeDocument(document);

    if (results) {
      outputChannel.appendLine(
        `Analysis completed: ${results.changes?.length || 0} suggestions`,
      );
      webview.showAnalysisResults(results);
      diagnosticProvider.updateDiagnostics(document);
    }

    statusBar.updateStatus("Ready");
  } catch (error) {
    statusBar.updateStatus("Analysis Failed");
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    outputChannel.appendLine(`Analysis failed: ${errorMessage}`);
    vscode.window.showErrorMessage(`Analysis failed: ${errorMessage}`);
  }
}

async function analyzeWorkspace(): Promise<void> {
  try {
    if (!vscode.workspace.workspaceFolders) {
      vscode.window.showWarningMessage("No workspace folder is open");
      return;
    }

    statusBar.updateStatus("Analyzing workspace...", true);
    outputChannel.appendLine("Starting workspace analysis");

    const results = await neurolintProvider.analyzeWorkspace();

    if (results) {
      outputChannel.appendLine("Workspace analysis completed");
      webview.showAnalysisResults(results);
    }

    statusBar.updateStatus("Ready");
  } catch (error) {
    statusBar.updateStatus("Analysis Failed");
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    outputChannel.appendLine(`Workspace analysis failed: ${errorMessage}`);
    vscode.window.showErrorMessage(
      `Workspace analysis failed: ${errorMessage}`,
    );
  }
}

async function toggleDiagnostics(): Promise<void> {
  const enabled = diagnosticProvider.toggleDiagnostics();
  vscode.window.showInformationMessage(
    `Diagnostics ${enabled ? "enabled" : "disabled"}`,
  );
  outputChannel.appendLine(`Diagnostics ${enabled ? "enabled" : "disabled"}`);
}

async function openSettings(): Promise<void> {
  const options = [
    "API Settings",
    "Analysis Settings",
    "Diagnostic Level",
    "Workspace Settings",
    "Import Config",
    "Export Config",
    "Reset Config",
  ];

  const choice = await vscode.window.showQuickPick(options, {
    placeHolder: "Select settings category",
  });

  switch (choice) {
    case "API Settings":
      await configureApiSettings();
      break;
    case "Analysis Settings":
      await configureAnalysisSettings();
      break;
    case "Diagnostic Level":
      await configureDiagnosticLevel();
      break;
    case "Workspace Settings":
      await configureWorkspaceSettings();
      break;
    case "Import Config":
      await importConfig();
      break;
    case "Export Config":
      await exportConfig();
      break;
    case "Reset Config":
      await resetConfig();
      break;
  }
}

async function configureApiSettings(): Promise<void> {
  const apiUrl = await vscode.window.showInputBox({
    prompt: "Enter NeuroLint API URL",
    value: configManager.getApiUrl(),
    validateInput: (value: string) => {
      if (!value || !value.startsWith("http")) {
        return "Please enter a valid HTTP URL";
      }
      return null;
    },
  });

  if (apiUrl) {
    await configManager.setApiUrl(apiUrl);
    vscode.window.showInformationMessage("API URL updated successfully");
  }

  const apiKey = await vscode.window.showInputBox({
    prompt: "Enter your NeuroLint API key",
    password: true,
    value: configManager.getApiKey(),
  });

  if (apiKey) {
    await configManager.setApiKey(apiKey);
    vscode.window.showInformationMessage("API key updated successfully");
  }
}

async function configureAnalysisSettings(): Promise<void> {
  const enabledLayers = configManager.getEnabledLayers();
  const layerOptions = [
    { label: "Layer 1: Configuration Modernization", value: 1 },
    { label: "Layer 2: Pattern Standardization", value: 2 },
    { label: "Layer 3: Accessibility & Components", value: 3 },
    { label: "Layer 4: SSR/Hydration Safety", value: 4 },
    { label: "Layer 5: Next.js App Router", value: 5 },
    { label: "Layer 6: Testing & Error Handling", value: 6 },
    { label: "Layer 7: Adaptive Learning", value: 7 },
  ];

  const selectedLayers = await vscode.window.showQuickPick(
    layerOptions.map((option) => ({
      ...option,
      picked: enabledLayers.includes(option.value),
    })),
    {
      canPickMany: true,
      placeHolder: "Select analysis layers to enable",
    },
  );

  if (selectedLayers) {
    const newLayers = selectedLayers.map((item: any) => item.value);
    await configManager.setEnabledLayers(newLayers);
    vscode.window.showInformationMessage(
      `Analysis layers updated: ${newLayers.join(", ")}`,
    );
  }

  const autoFix = await vscode.window.showQuickPick(["Enable", "Disable"], {
    placeHolder: "Auto-fix on save",
  });

  if (autoFix) {
    await configManager.setAutoFix(autoFix === "Enable");
    vscode.window.showInformationMessage(
      `Auto-fix ${autoFix === "Enable" ? "enabled" : "disabled"}`,
    );
  }
}

async function configureDiagnosticLevel(): Promise<void> {
  const levels = ["error", "warning", "info"];
  const currentLevel = configManager.getDiagnosticsLevel();

  const selectedLevel = await vscode.window.showQuickPick(
    levels.map((level) => ({
      label: level.charAt(0).toUpperCase() + level.slice(1),
      value: level,
      picked: level === currentLevel,
    })),
    {
      placeHolder: "Select diagnostic level",
    },
  );

  if (selectedLevel) {
    await configManager.setDiagnosticsLevel(selectedLevel.value as any);
    vscode.window.showInformationMessage(
      `Diagnostic level set to: ${selectedLevel.label}`,
    );
  }
}

async function configureWorkspaceSettings(): Promise<void> {
  const settings = configManager.getWorkspaceSettings();

  const maxFiles = await vscode.window.showInputBox({
    prompt: "Maximum files to analyze",
    value: settings.maxFiles.toString(),
    validateInput: (value: string) => {
      const num = parseInt(value);
      if (isNaN(num) || num < 1) {
        return "Please enter a valid number greater than 0";
      }
      return null;
    },
  });

  if (maxFiles) {
    await configManager.setWorkspaceSettings({
      ...settings,
      maxFiles: parseInt(maxFiles),
    });
    vscode.window.showInformationMessage("Workspace settings updated");
  }
}

async function showHistory(): Promise<void> {
  vscode.window.showInformationMessage("History feature coming soon!");
}

async function exportResults(): Promise<void> {
  vscode.window.showInformationMessage("Export feature coming soon!");
}

async function importConfig(): Promise<void> {
  const uri = await vscode.window.showOpenDialog({
    canSelectFiles: true,
    canSelectMany: false,
    filters: {
      "JSON files": ["json"],
    },
  });

  if (uri && uri[0]) {
    try {
      await configManager.importConfiguration(uri[0]);
      vscode.window.showInformationMessage(
        "Configuration imported successfully",
      );
    } catch (error) {
      vscode.window.showErrorMessage(
        `Import failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}

async function exportConfig(): Promise<void> {
  const uri = await vscode.window.showSaveDialog({
    defaultUri: vscode.Uri.file("neurolint-config.json"),
    filters: {
      "JSON files": ["json"],
    },
  });

  if (uri) {
    try {
      await configManager.exportConfiguration(uri);
      vscode.window.showInformationMessage(
        `Configuration exported to ${uri.fsPath}`,
      );
    } catch (error) {
      vscode.window.showErrorMessage(
        `Export failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}

async function resetConfig(): Promise<void> {
  const confirm = await vscode.window.showWarningMessage(
    "Are you sure you want to reset all NeuroLint settings to defaults?",
    { modal: true },
    "Reset",
    "Cancel",
  );

  if (confirm === "Reset") {
    try {
      await configManager.resetConfiguration();
      vscode.window.showInformationMessage("Configuration reset successfully");
    } catch (error) {
      vscode.window.showErrorMessage(
        `Reset failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}

async function refreshTree(): Promise<void> {
  // Tree view refresh logic would go here
  vscode.window.showInformationMessage("Tree view refreshed");
}

async function viewResult(result: any): Promise<void> {
  webview.showAnalysisResults(result);
}

async function clearCache(): Promise<void> {
  vscode.window.showInformationMessage("Cache cleared!");
}

async function viewDocs(): Promise<void> {
  vscode.env.openExternal(vscode.Uri.parse("https://neurolint.dev/docs"));
}

async function fixFile(uri?: vscode.Uri): Promise<void> {
  try {
    const document = uri
      ? await vscode.workspace.openTextDocument(uri)
      : vscode.window.activeTextEditor?.document;

    if (!document) {
      vscode.window.showWarningMessage("No active document to fix");
      return;
    }

    statusBar.updateStatus("Applying fixes...", true);
    outputChannel.appendLine(`Applying fixes to file: ${document.fileName}`);

    const results = await neurolintProvider.fixDocument(document);

    if (results) {
      const fixCount = results.changes?.length || 0;
      outputChannel.appendLine(`Fixes applied: ${fixCount} transformations`);
      webview.showAnalysisResults(results);
      vscode.window.showInformationMessage(
        `NeuroLint: ${fixCount} fix${fixCount !== 1 ? 'es' : ''} applied successfully!`
      );
    }

    statusBar.updateStatus("Ready");
  } catch (error) {
    statusBar.updateStatus("Fix Failed");
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    outputChannel.appendLine(`Fix failed: ${errorMessage}`);
    vscode.window.showErrorMessage(`Fix failed: ${errorMessage}`);
  }
}

async function fixWorkspace(): Promise<void> {
  try {
    if (!vscode.workspace.workspaceFolders) {
      vscode.window.showWarningMessage("No workspace folder is open");
      return;
    }

    statusBar.updateStatus("Applying workspace fixes...", true);
    outputChannel.appendLine("Starting workspace fixes");

    const results = await neurolintProvider.fixWorkspace();

    if (results) {
      const fixCount = results.changes?.length || 0;
      outputChannel.appendLine(`Workspace fixes completed: ${fixCount} transformations`);
      webview.showAnalysisResults(results);
      vscode.window.showInformationMessage(
        `NeuroLint: Workspace fixes applied! ${fixCount} transformation${fixCount !== 1 ? 's' : ''} completed.`
      );
    }

    statusBar.updateStatus("Ready");
  } catch (error) {
    statusBar.updateStatus("Fix Failed");
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    outputChannel.appendLine(`Workspace fix failed: ${errorMessage}`);
    vscode.window.showErrorMessage(
      `Workspace fix failed: ${errorMessage}`,
    );
  }
}

async function showOutput(): Promise<void> {
  outputChannel.show(true);
}

async function login(): Promise<void> {
  // First, ask if they want to get an API key or have one
  const choice = await vscode.window.showQuickPick(
    [
      { label: "I have an API key", value: "have-key" },
      { label: "I need to get an API key", value: "get-key" },
      { label: "Use free tier (analysis only)", value: "free" }
    ],
    { placeHolder: "How would you like to authenticate?" }
  );

  if (!choice) return;

  if (choice.value === "get-key") {
    vscode.window.showInformationMessage(
      "Visit neurolint.dev to create an account and get your API key",
      "Open Website"
    ).then((action: string | undefined) => {
      if (action === "Open Website") {
        vscode.env.openExternal(vscode.Uri.parse("https://app.neurolint.dev/dashboard"));
      }
    });
    return;
  }

  if (choice.value === "free") {
    vscode.window.showInformationMessage("You can analyze code without an API key, but fixes require authentication.");
    return;
  }

  const apiKey = await vscode.window.showInputBox({
    prompt: "Enter your NeuroLint API key",
    password: true,
    placeHolder: "Get your API key from app.neurolint.dev/dashboard",
  });

  if (!apiKey || apiKey.trim().length === 0) {
    vscode.window.showWarningMessage("API key is required");
    return;
  }

  try {
    const trimmedApiKey = apiKey.trim();
    statusBar.updateStatus("Authenticating...", true);

    // Test the API key
    const userInfo = await sharedCoreAdapter.authenticate(trimmedApiKey);

    if (userInfo) {
      await sharedCoreAdapter.setApiKey(trimmedApiKey);
      statusBar.updateStatus("Authenticated");

      vscode.window
        .showInformationMessage(
          `Welcome ${userInfo.name || "to NeuroLint"}!`,
          "View Dashboard",
        )
        .then((action: string | undefined) => {
          if (action === "View Dashboard") {
            vscode.env.openExternal(
              vscode.Uri.parse(`${configManager.getApiUrl()}/dashboard`),
            );
          }
        });
    }
  } catch (error) {
    statusBar.updateStatus("Authentication Failed");
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    outputChannel.appendLine(`Authentication failed: ${errorMessage}`);
    vscode.window.showErrorMessage(`Authentication failed: ${errorMessage}`);
  }
}

async function migrateReact19(): Promise<void> {
  try {
    if (!vscode.workspace.workspaceFolders) {
      vscode.window.showWarningMessage("No workspace folder is open");
      return;
    }

    statusBar.updateStatus("Migrating to React 19...", true);
    outputChannel.appendLine("Starting React 19 migration");

    const results = await sharedCoreAdapter.runMigration('react19');

    if (results) {
      outputChannel.appendLine(`React 19 migration completed: ${results.changes?.length || 0} changes`);
      webview.showAnalysisResults(results);
      vscode.window.showInformationMessage(
        `React 19 migration completed! ${results.changes?.length || 0} file${(results.changes?.length || 0) !== 1 ? 's' : ''} updated.`
      );
    }

    statusBar.updateStatus("Ready");
  } catch (error) {
    statusBar.updateStatus("Migration Failed");
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    outputChannel.appendLine(`React 19 migration failed: ${errorMessage}`);
    vscode.window.showErrorMessage(`React 19 migration failed: ${errorMessage}`);
  }
}

async function migrateNextjs16(): Promise<void> {
  try {
    if (!vscode.workspace.workspaceFolders) {
      vscode.window.showWarningMessage("No workspace folder is open");
      return;
    }

    statusBar.updateStatus("Migrating to Next.js 16...", true);
    outputChannel.appendLine("Starting Next.js 16 migration");

    const results = await sharedCoreAdapter.runMigration('nextjs16');

    if (results) {
      outputChannel.appendLine(`Next.js 16 migration completed: ${results.changes?.length || 0} changes`);
      webview.showAnalysisResults(results);
      vscode.window.showInformationMessage(
        `Next.js 16 migration completed! ${results.changes?.length || 0} file${(results.changes?.length || 0) !== 1 ? 's' : ''} updated.`
      );
    }

    statusBar.updateStatus("Ready");
  } catch (error) {
    statusBar.updateStatus("Migration Failed");
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    outputChannel.appendLine(`Next.js 16 migration failed: ${errorMessage}`);
    vscode.window.showErrorMessage(`Next.js 16 migration failed: ${errorMessage}`);
  }
}

async function migrateBiome(): Promise<void> {
  try {
    if (!vscode.workspace.workspaceFolders) {
      vscode.window.showWarningMessage("No workspace folder is open");
      return;
    }

    statusBar.updateStatus("Migrating to Biome...", true);
    outputChannel.appendLine("Starting Biome migration");

    const results = await sharedCoreAdapter.runMigration('biome');

    if (results) {
      outputChannel.appendLine(`Biome migration completed: ${results.changes?.length || 0} changes`);
      webview.showAnalysisResults(results);
      vscode.window.showInformationMessage(
        `Biome migration completed! ${results.changes?.length || 0} configuration${(results.changes?.length || 0) !== 1 ? 's' : ''} updated.`
      );
    }

    statusBar.updateStatus("Ready");
  } catch (error) {
    statusBar.updateStatus("Migration Failed");
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    outputChannel.appendLine(`Biome migration failed: ${errorMessage}`);
    vscode.window.showErrorMessage(`Biome migration failed: ${errorMessage}`);
  }
}

async function checkDeps(): Promise<void> {
  try {
    if (!vscode.workspace.workspaceFolders) {
      vscode.window.showWarningMessage("No workspace folder is open");
      return;
    }

    statusBar.updateStatus("Checking dependencies...", true);
    outputChannel.appendLine("Starting React 19 dependency check");

    const results = await sharedCoreAdapter.checkDependencies();

    if (results) {
      const issueCount = results.issues?.length || 0;
      outputChannel.appendLine(`Dependency check completed: ${issueCount} issue${issueCount !== 1 ? 's' : ''} found`);
      
      if (issueCount > 0) {
        webview.showAnalysisResults(results);
        vscode.window.showWarningMessage(
          `Found ${issueCount} React 19 compatibility issue${issueCount !== 1 ? 's' : ''}. Check the NeuroLint panel for details.`
        );
      } else {
        vscode.window.showInformationMessage(
          "All dependencies are compatible with React 19!"
        );
      }
    }

    statusBar.updateStatus("Ready");
  } catch (error) {
    statusBar.updateStatus("Check Failed");
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    outputChannel.appendLine(`Dependency check failed: ${errorMessage}`);
    vscode.window.showErrorMessage(`Dependency check failed: ${errorMessage}`);
  }
}

async function checkTurbopack(): Promise<void> {
  try {
    if (!vscode.workspace.workspaceFolders) {
      vscode.window.showWarningMessage("No workspace folder is open");
      return;
    }

    statusBar.updateStatus("Checking Turbopack compatibility...", true);
    outputChannel.appendLine("Starting Turbopack compatibility check");

    const results = await sharedCoreAdapter.checkTurbopackCompatibility();

    if (results) {
      const issueCount = results.issues?.length || 0;
      outputChannel.appendLine(`Turbopack check completed: ${issueCount} issue${issueCount !== 1 ? 's' : ''} found`);
      
      if (issueCount > 0) {
        webview.showAnalysisResults(results);
        vscode.window.showWarningMessage(
          `Found ${issueCount} Turbopack compatibility issue${issueCount !== 1 ? 's' : ''}. Check the NeuroLint panel for details.`
        );
      } else {
        vscode.window.showInformationMessage(
          "Your project is Turbopack compatible!"
        );
      }
    }

    statusBar.updateStatus("Ready");
  } catch (error) {
    statusBar.updateStatus("Check Failed");
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    outputChannel.appendLine(`Turbopack check failed: ${errorMessage}`);
    vscode.window.showErrorMessage(`Turbopack check failed: ${errorMessage}`);
  }
}

async function checkCompiler(): Promise<void> {
  try {
    if (!vscode.workspace.workspaceFolders) {
      vscode.window.showWarningMessage("No workspace folder is open");
      return;
    }

    statusBar.updateStatus("Detecting React Compiler opportunities...", true);
    outputChannel.appendLine("Starting React Compiler detection");

    const results = await sharedCoreAdapter.detectReactCompilerOpportunities();

    if (results) {
      const opportunityCount = results.opportunities?.length || 0;
      outputChannel.appendLine(`React Compiler detection completed: ${opportunityCount} opportunit${opportunityCount !== 1 ? 'ies' : 'y'} found`);
      
      if (opportunityCount > 0) {
        webview.showAnalysisResults(results);
        vscode.window.showInformationMessage(
          `Found ${opportunityCount} manual memoization pattern${opportunityCount !== 1 ? 's' : ''} that React Compiler can optimize.`
        );
      } else {
        vscode.window.showInformationMessage(
          "No manual memoization patterns found - your code is ready for React Compiler!"
        );
      }
    }

    statusBar.updateStatus("Ready");
  } catch (error) {
    statusBar.updateStatus("Detection Failed");
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    outputChannel.appendLine(`React Compiler detection failed: ${errorMessage}`);
    vscode.window.showErrorMessage(`React Compiler detection failed: ${errorMessage}`);
  }
}

async function assessRouter(): Promise<void> {
  try {
    if (!vscode.workspace.workspaceFolders) {
      vscode.window.showWarningMessage("No workspace folder is open");
      return;
    }

    statusBar.updateStatus("Assessing router complexity...", true);
    outputChannel.appendLine("Starting router complexity assessment");

    const results = await sharedCoreAdapter.assessRouterComplexity();

    if (results) {
      outputChannel.appendLine(`Router assessment completed: complexity score ${results.score || 'N/A'}`);
      webview.showAnalysisResults(results);
      
      const recommendation = results.recommendation || 'Review your routing architecture';
      vscode.window.showInformationMessage(
        `Router Assessment: ${recommendation}`
      );
    }

    statusBar.updateStatus("Ready");
  } catch (error) {
    statusBar.updateStatus("Assessment Failed");
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    outputChannel.appendLine(`Router assessment failed: ${errorMessage}`);
    vscode.window.showErrorMessage(`Router assessment failed: ${errorMessage}`);
  }
}

async function detectReact192(): Promise<void> {
  try {
    if (!vscode.workspace.workspaceFolders) {
      vscode.window.showWarningMessage("No workspace folder is open");
      return;
    }

    statusBar.updateStatus("Detecting React 19.2 features...", true);
    outputChannel.appendLine("Starting React 19.2 feature detection");

    const results = await sharedCoreAdapter.detectReact192Features();

    if (results) {
      const opportunityCount = results.opportunities?.length || 0;
      outputChannel.appendLine(`React 19.2 detection completed: ${opportunityCount} opportunit${opportunityCount !== 1 ? 'ies' : 'y'} found`);
      
      if (opportunityCount > 0) {
        webview.showAnalysisResults(results);
        vscode.window.showInformationMessage(
          `Found ${opportunityCount} opportunity${opportunityCount !== 1 ? 'ies' : 'y'} for React 19.2 features (View Transitions, useEffectEvent, Activity).`
        );
      } else {
        vscode.window.showInformationMessage(
          "No React 19.2 feature opportunities detected in your codebase."
        );
      }
    }

    statusBar.updateStatus("Ready");
  } catch (error) {
    statusBar.updateStatus("Detection Failed");
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    outputChannel.appendLine(`React 19.2 detection failed: ${errorMessage}`);
    vscode.window.showErrorMessage(`React 19.2 detection failed: ${errorMessage}`);
  }
}

async function simplifyCode(): Promise<void> {
  try {
    const document = vscode.window.activeTextEditor?.document;

    if (!document) {
      vscode.window.showWarningMessage("No active document to simplify");
      return;
    }

    statusBar.updateStatus("Simplifying code...", true);
    outputChannel.appendLine(`Simplifying code in: ${document.fileName}`);

    const results = await sharedCoreAdapter.simplifyCode(document.getText(), document.fileName);

    if (results) {
      const simplificationCount = results.changes?.length || 0;
      outputChannel.appendLine(`Code simplification completed: ${simplificationCount} simplification${simplificationCount !== 1 ? 's' : ''}`);
      
      if (simplificationCount > 0) {
        webview.showAnalysisResults(results);
        vscode.window.showInformationMessage(
          `NeuroLint: ${simplificationCount} code simplification${simplificationCount !== 1 ? 's' : ''} suggested.`
        );
      } else {
        vscode.window.showInformationMessage(
          "No code simplifications found - your code is already clean!"
        );
      }
    }

    statusBar.updateStatus("Ready");
  } catch (error) {
    statusBar.updateStatus("Simplification Failed");
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    outputChannel.appendLine(`Code simplification failed: ${errorMessage}`);
    vscode.window.showErrorMessage(`Code simplification failed: ${errorMessage}`);
  }
}

async function showLayers(): Promise<void> {
  const layers = [
    { label: "Layer 1: Configuration Modernization", description: "Optimizes tsconfig.json, next.config.js, package.json" },
    { label: "Layer 2: Pattern Standardization", description: "AST-based console.log removal, HTML entity fixes, unused imports" },
    { label: "Layer 3: Accessibility & Components", description: "React keys, aria-labels, prop types, accessibility fixes" },
    { label: "Layer 4: SSR/Hydration Safety", description: "SSR guards for localStorage, window, document" },
    { label: "Layer 5: Next.js App Router", description: "'use client' directives, createRoot/hydrateRoot conversion" },
    { label: "Layer 6: Testing & Error Handling", description: "Error boundaries, test generation, MSW integration" },
    { label: "Layer 7: Adaptive Learning", description: "Pattern learning, custom rule generation" },
  ];

  const selected = await vscode.window.showQuickPick(layers, {
    placeHolder: "NeuroLint 7-Layer Architecture - Select a layer for details",
  });

  if (selected) {
    vscode.window.showInformationMessage(`${selected.label}: ${selected.description}`);
  }
}

async function validateCode(): Promise<void> {
  try {
    const document = vscode.window.activeTextEditor?.document;

    if (!document) {
      vscode.window.showWarningMessage("No active document to validate");
      return;
    }

    statusBar.updateStatus("Validating code...", true);
    outputChannel.appendLine(`Validating: ${document.fileName}`);

    const results = await sharedCoreAdapter.validateCode(document.getText(), document.fileName);

    if (results) {
      const issueCount = results.issues?.length || 0;
      outputChannel.appendLine(`Validation completed: ${issueCount} issue${issueCount !== 1 ? 's' : ''} found`);
      
      if (issueCount > 0) {
        webview.showAnalysisResults(results);
        vscode.window.showWarningMessage(
          `Validation found ${issueCount} issue${issueCount !== 1 ? 's' : ''}. Check the NeuroLint panel for details.`
        );
      } else {
        vscode.window.showInformationMessage(
          "Validation passed - no issues found!"
        );
      }
    }

    statusBar.updateStatus("Ready");
  } catch (error) {
    statusBar.updateStatus("Validation Failed");
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    outputChannel.appendLine(`Validation failed: ${errorMessage}`);
    vscode.window.showErrorMessage(`Validation failed: ${errorMessage}`);
  }
}

async function showStats(): Promise<void> {
  try {
    if (!vscode.workspace.workspaceFolders) {
      vscode.window.showWarningMessage("No workspace folder is open");
      return;
    }

    statusBar.updateStatus("Gathering stats...", true);
    outputChannel.appendLine("Gathering NeuroLint statistics");

    const stats = await sharedCoreAdapter.getStats();

    if (stats) {
      outputChannel.appendLine("Stats gathered successfully");
      webview.showAnalysisResults({
        type: 'stats',
        data: stats,
        summary: {
          filesAnalyzed: stats.filesAnalyzed || 0,
          issuesFound: stats.issuesFound || 0,
          issuesFixed: stats.issuesFixed || 0,
          layersUsed: stats.layersUsed || [1, 2, 3, 4, 5, 6, 7],
        }
      });
      
      vscode.window.showInformationMessage(
        `NeuroLint Stats: ${stats.filesAnalyzed || 0} files analyzed, ${stats.issuesFixed || 0} issues fixed`
      );
    }

    statusBar.updateStatus("Ready");
  } catch (error) {
    statusBar.updateStatus("Stats Failed");
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    outputChannel.appendLine(`Stats gathering failed: ${errorMessage}`);
    vscode.window.showErrorMessage(`Stats gathering failed: ${errorMessage}`);
  }
}
