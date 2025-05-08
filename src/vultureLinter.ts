'use strict';
import { workspace, Disposable, Diagnostic, DiagnosticSeverity, Range, WorkspaceConfiguration } from 'vscode';

import { LintingProvider, LinterConfiguration, Linter } from './utils/lintingProvider';

export default class VultureLintingProvider implements Linter {

    public languageId = 'python';

    public activate(subscriptions: Disposable[]) {
        console.log('Activated!');
        let provider = new LintingProvider(this);
        provider.activate(subscriptions);
    }

    public loadConfiguration(): LinterConfiguration {
        let section = workspace.getConfiguration(this.languageId);
        if (!section) {
            section = workspace.getConfiguration();
        }

        return {
            executable: section.get<string>('linting.vulturePath', 'vulture'),
            fileArgs: [],
            bufferArgs: [],
            extraArgs: section.get<Array<string>>('linting.vultureArgs', []),
            runTrigger: section.get<string>('linting.run', 'onType')
        };
    }

    public process(lines: string[]): Diagnostic[] {
        let diagnostics: Diagnostic[] = [];
        lines.forEach(function (line) {
            console.log(line);
            const regex = /(\d+):\s*(.+)/;
            const matches = regex.exec(line);
            if (matches === null) {
                return;
            }
            diagnostics.push({
                range: new Range(parseInt(matches[1]) - 1, 0, parseInt(matches[1]) - 1, Number.MAX_VALUE),
                severity: DiagnosticSeverity.Warning,
                message: matches[2],
                code: undefined,
                source: 'vulture'
            });
        });
        return diagnostics;
    }
}
