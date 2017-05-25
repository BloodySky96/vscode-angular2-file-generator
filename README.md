# vscode-angular2-file-generator

This project is Visual Studio Code extension for generating files for akveo / ng2-admin. 

This project is based on dbaikov / vscode-angular2-component-generator


## Discription
This will generate files listed below :
- index.ts
- givenname.component.ts
- givenname.module.ts    
- givenname.html
- givenname.scss 
- givenname.routing.ts

## Usage
Operation is same as Great Extension vscode-angular2-component-generator / dbaikov 
        you can check orginal extension here : https://marketplace.visualstudio.com/items?itemName=dbaikov.vscode-angular2-component-generator

Although it is good to use, to simplify my works with ng2-admin I add some files.
To avoid conflicts with based extension, I changed control name to 'New Angular2 Files'.


## Configuration
- global:
    - quotes - `single` or `double` in other words ( `'`  or  `"` )
    - generateFolder - `true` or `false` generate or not separate folder for newly created component
- create true / false - (controls weather to generate this file or not)
- extension - extension of generated file (e.g. you might want to change "scss" to just plain "css")
- template - path to the custom template for the generated file
    - {selector}    -> replaced with `lower case, dash separated string`
    - {templateUrl} -> replaced with `${selector}.component.html`
    - {styleUrls}   -> replaced with `${selector}.component.css`
    - {className}   -> replaced with `componentName in PascalCase`

Use the "template" key to override default templates for the extension

```json
{
    "global": {
        "quotes": "single", // or "double",
        "generateFolder": true, // or false
    },
    "files": {
        "component": {
            "create": true,
            "extension": "ts"
            // if needed
            // , "template": "${workspaceRoot}/myComponent.template"
        },
        "css": {
            "create": true,
            "extension": "scss"
            // if needed
            // , "template": "${workspaceRoot}/mycss.template"
        },
        "html": {
            "create": true,
            "extension": "html"
            // if needed
            // , "template": "${workspaceRoot}/myhtml.template"
        },
        "module": {
            "create": true,
            "extension": "ts"
            // if needed
            // , "template": "${workspaceRoot}/mymodule.template"
        },
        "routing": {
            "create": true,
            "extension": "ts"
            // if needed
            // , "template": "${workspaceRoot}/myrouting.template"
        },
        "index": {
            "create": true,
            "extension": "ts"
            // if needed
            // , "template": "${workspaceRoot}/index.template"
        }
    }
}
 

### Change Log

#### 0.0.1 (2017-05-25)
- release 0.0.1 
