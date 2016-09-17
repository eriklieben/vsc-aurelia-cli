"use strict";
import * as vscode from "vscode";
import * as cp from "child_process";
import * as path from "path";
import * as fs from "fs";
import { runInTerminal } from "run-in-terminal";

let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
    registerCommands(context);
    outputChannel = vscode.window.createOutputChannel("au");
    context.subscriptions.push(outputChannel);
}

function registerCommands(context: vscode.ExtensionContext) {

    context.subscriptions.push(vscode.commands.registerCommand("extension.auNew", () => {
        let project = vscode.window.showInputBox({ placeHolder: "name of your project" }).then(
            (data) => {
                runCommand(["new", data], true);
            }
        )
    }));

    context.subscriptions.push(vscode.commands.registerCommand("extension.auGenerate", () => {
        let param: string[] = ["generate"];
        let auTemplatePath = path.join(vscode.workspace.rootPath, "aurelia_project/generators");
        let items = [];
        fs.readdirSync(auTemplatePath).forEach(function (name) {
           if (path.extname(name) === ".ts") {
                items.push(path.basename(name.replace(".ts", "").replace(".js", "")));
           }
        });

        let options = { matchOnDescription: false, placeHolder: "select type" };
        vscode.window.showQuickPick(items, options).then((data) => {
            param.push(data);
            vscode.window.showInputBox({ placeHolder: "name of the " + data }).then(
                (name) => {
                    param.push(name);
                    runCommand(param, false);
                }
            );
        });
    }));

    context.subscriptions.push(vscode.commands.registerCommand("extension.auTest", () => {
        runCommand(["test"], false);
    }));

    context.subscriptions.push(vscode.commands.registerCommand("extension.auBuild", () => {
        let param: string[] = ["build"];
        let auTemplatePath = path.join(vscode.workspace.rootPath, "aurelia_project/environments");
        let items = [];
        fs.readdirSync(auTemplatePath).forEach(function (name) {
           if (path.extname(name) === ".ts") {
                items.push(path.basename(name.replace(".ts", "").replace(".js", "")));
           }
        });

        let options = { matchOnDescription: false, placeHolder: "select environment" };
        vscode.window.showQuickPick(items, options).then((data) => {
            param.push("--env " + data);
            runCommand(param, false);
        });
    }));
}

function runCommandInOutputWindow(args: string[], cwd: string) {
    let cmd = "au " + args.join(" ");
    let p = cp.exec(cmd, { cwd: cwd, env: process.env });
    p.stderr.on("data", (data: string) => {
        outputChannel.append(data);
    });
    p.stdout.on("data", (data: string) => {
        outputChannel.append(data);
    });
    showOutput();
}

function runCommandInTerminal(args: string[], cwd: string): void {
    runInTerminal("au", args, { cwd: cwd, env: process.env });
}

function showOutput(): void {
    outputChannel.show(vscode.ViewColumn.Three);
}

function runCommand(args: string[], useTerminal?: boolean): void {

    let cwd = vscode.workspace.rootPath;

    if (useTerminal) {
        runCommandInTerminal(args, cwd);
    } else {
        runCommandInOutputWindow(args, cwd);
    }
}

