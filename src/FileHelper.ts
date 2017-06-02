import { HTMLConfig } from './config/types/html-config.interface';
import { CSSConfig } from './config/types/css-config.interface';
import { ModuleConfig } from './config/types/module-config.interface';
import { FileConfig } from './config/files.interface';
import { GlobalConfig } from './config/global.interface';
import { Config } from './config.interface';
import * as vscode from 'vscode';
import * as fse from 'fs-extra';
import * as fs from 'fs';
import * as path from 'path';
import * as changeCase from 'change-case';
import { Observable } from 'rxjs';

export class FileHelper {

    

    private static createFile = <(file: string, data: string) => Observable<{}>>Observable.bindNodeCallback(fse.outputFile);
    private static assetRootDir: string = path.join(__dirname, '../../assets');

    

    public static createAllItems(componentDir: string, componentName: string, globalConfig: GlobalConfig, config: FileConfig): Observable<string[]> {

        let arrItems: any = [];

        Object.keys(config).forEach((itemName) => 
            {
                arrItems.push(this.createItems(itemName, componentDir, componentName, globalConfig, config[itemName], config ));
            }
        );
        return Observable.forkJoin(arrItems);
    }

    private static createItems(itemName: string, componentDir: string, componentName: string, globalConfig: GlobalConfig, config: any, configF: FileConfig) : Observable<string>{
        let templateFileName = this.assetRootDir + '/templates/' + itemName + '.template';
        
        if (config.template) {
            templateFileName = this.resolveWorkspaceRoot(config.template);
        }
        
        let componentContent = "";

        if(fs.existsSync(templateFileName)){
            componentContent = this.replaceContentItems(templateFileName, componentName, globalConfig, configF);
        }

        let filename = '';
        switch(itemName){
            case "html" :
            case "css" :
                filename =  `${componentDir}/${componentName}.${config.extension}`;
                break;
            case "index" :
                filename =  `${componentDir}/${itemName}.${config.extension}`;
                break;                
            default :
                filename = `${componentDir}/${componentName}.${itemName}.${config.extension}`;
                break;
        }

        if (config.create) {
            return this.createFile(filename, componentContent)
                .map(result => filename);
        }
        else {
            return Observable.of('');
        }

    }


    private static replaceContentItems(templateFileName: string, componentName: string, globalConfig: GlobalConfig, config: FileConfig): any{

        return fs.readFileSync( templateFileName ).toString()
            .replace(/{selector}/g, componentName)
            .replace(/{templateUrl}/g, `${componentName}.${config.html.extension}`)
            .replace(/{styleUrls}/g, `${componentName}.${config.css.extension}`)
            .replace(/{className}/g, changeCase.pascalCase(componentName))
            .replace(/{quotes}/g, this.getQuotes(globalConfig));
            
    }


    public static createComponentDir(uri: any, componentName: string, globalConfig: GlobalConfig): string {
        let contextMenuSourcePath;
        
        if (uri && fs.lstatSync(uri.fsPath).isDirectory()) {
            contextMenuSourcePath = uri.fsPath;
        } else if (uri) {
            contextMenuSourcePath = path.dirname(uri.fsPath);
        } else {
            contextMenuSourcePath = vscode.workspace.rootPath;
        }

        let componentDir = `${contextMenuSourcePath}`;
        if(globalConfig.generateFolder) {
            componentDir = `${contextMenuSourcePath}/${componentName}`;

            if(!fse.existsSync(componentDir)){
                fse.mkdirsSync(componentDir);
                if(globalConfig.automodify){
                    this.modifyModule(contextMenuSourcePath, componentName);
                    this.modifyRoute(contextMenuSourcePath, componentName);
                }
            }else{
                componentDir = 'duple'
            }
        }

        return componentDir;
    }

    public static getlastStringBlocks(targetString: string, beginString: string, endString: string): string{
        var findString = targetString.substring(targetString.lastIndexOf(beginString), targetString.length);
        return findString.substring(0, findString.indexOf(endString)+1);
    }

    public static getFirstStringBlocks(targetString: string, beginString: string, endString: string){
        var findString = targetString.substring(targetString.indexOf(beginString), targetString.length);
        return findString.substring(0, findString.indexOf(endString)+1);
    }

    public static getReplacableStrings(TargetString: string): string{
        var dItems = this.getFirstStringBlocks(TargetString, '[',']');
        return TargetString.replace(dItems, dItems.replace(/\s/g,''));
    }

    private static modifyModule(contextMenuSourcePath: any, componentName: string){

        // check module file exists in target folder 
        var tempcon = contextMenuSourcePath.split('/');
        var mdFileName = contextMenuSourcePath + '/' + tempcon[tempcon.length-1] + '.module.ts';
        if(fs.existsSync(mdFileName)){

            var strfile = fs.readFileSync(mdFileName).toString();
            let className = changeCase.pascalCase(componentName);

            var lastimportstring = this.getlastStringBlocks(strfile, 'import ', ';');
            var importString = `import { ${className} } from './${componentName}/${componentName}.component';`;

            // if import exists do not append 
            if(!strfile.includes(importString)){
                strfile = strfile.replace(lastimportstring, lastimportstring + '\n' + importString);

                var Replacables = this.getFirstStringBlocks(strfile, 'declarations',']');            
                var resultReplacable = this.getReplacableStrings(Replacables)
                                                        .replace(']', `,${className}]`)
                                                        .replace('[', '[ \n \t\t')
                                                        .replace(/,/g, ', \n \t\t')
                                                        .replace(']', '\n \t]'); 

                fs.writeFileSync(mdFileName, strfile.replace(Replacables, resultReplacable)) ;
            }
        }
    }

    private static modifyRoute(contextMenuSourcePath: any, componentName: string){

        // check router file exists in target folder 
        var tempcon = contextMenuSourcePath.split('/');
        var rtFileName = contextMenuSourcePath + '/' + tempcon[tempcon.length-1] + '.routing.ts';

        // if it exists read file and add child routes 
        if(fs.existsSync(rtFileName)){
            var strfile = fs.readFileSync(rtFileName).toString();
            let className = changeCase.pascalCase(componentName);

            // add import component to router
            var importString = `import { ${className} } from './${componentName}/${componentName}.component'`;
            
            // if import exists do not append 
            if(!strfile.includes(importString)){

                strfile = strfile.replace(`@angular/router';`, `@angular/router';` + '\n' + importString + ';');

                // add route of new component
                var Replacables = this.getFirstStringBlocks(strfile, 'children',']');            
                var resultReplacable = this.getReplacableStrings(Replacables)
                                                        .replace(']', `{path : ` + `'${componentName}'` + `, component: ` + `${className}`+ ` }]`)                                                    
                                                        .replace(/\s/g,'')
                                                        .replace(/}{/g, '},{')
                                                        .replace(/},{/g, '},\n \t\t\t\t{')
                                                        .replace('}]', '}\n\t\t]')
                                                        .replace('[', '[ \n \t\t\t\t')
                                                        .replace(/{/g, '{ ')
                                                        .replace(/:/g, ' : ')
                                                        .replace(/}/g, ' }')
                                                        .replace(/,/g, ', ');

                fs.writeFileSync(rtFileName, strfile.replace(Replacables, resultReplacable).replace(': ModuleWithProviders', ' ')) ;
            }
        }
        

    }


    public static getDefaultConfig(): any {
        let content = fs.readFileSync( this.assetRootDir + '/config/config.json' ).toString();
        content = content.replace(/\${workspaceRoot}/g, vscode.workspace.rootPath);
        return JSON.parse(content);
    }

    public static resolveWorkspaceRoot(path: string): string {
        return path.replace('${workspaceRoot}', vscode.workspace.rootPath);
    }

    private static getQuotes(config: GlobalConfig) {
        return config.quotes === "double" ? '"' : '\'';
    }


}
