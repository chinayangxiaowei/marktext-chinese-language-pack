import * as fs from "fs"
import * as path from "path"

function readStringArrayFromFile(fileName:string) : string[] {
    let ret_lines:string[] = [];
    if (fs.existsSync(fileName)) {
        let buffer = fs.readFileSync(fileName, "utf-8")
        let lines = (buffer as string).split(/[\r\n]/)
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim().length > 0) {
                ret_lines.push(lines[i])
            }
        }
    }
    return ret_lines;
}

function writeStringArrayToFile( fileName:string, dict:string[]) : void {
    fs.writeFileSync( fileName, dict.join('\n')+'\n' )
}

function searchLabelsFromFile( fileName:string, exclude: void|string[]) : string[] {
    let labels:string[] = []
    if (fs.existsSync(fileName)) {
        let buffer = fs.readFileSync(fileName, "utf-8")
        let pat = /(label):"(.*?)"/gms
        if (Array.isArray(exclude) && exclude.length > 0) {
            buffer.replace(pat, (match, key, value) => {
                if (exclude.indexOf(value) == -1) {
                    if (labels.indexOf(value) ==  -1){
                        labels.push(value)
                    }
                }
                return match
            })
        } else {
            buffer.replace(pat, (match, key, value) => {
                if (labels.indexOf(value) ==  -1){
                    labels.push(value)
                }
                return match
            })
        }
    }
    return labels;
}

function replaceLabelsFromFile( fileName:string, enDict: string[], toDict: string[]) : string {
    let content:string = ""
    if (enDict.length == toDict.length){
        if (fs.existsSync(fileName)) {
            let buffer = fs.readFileSync(fileName, "utf-8")
            let pat = /(label):"(.*?)"/gms
            content = buffer.replace(pat, (match, key, value) => {
                const idx = enDict.indexOf(value)
                if (idx != -1) {
                    return key + ':"' + toDict[idx] + '"'
                }
                return match
            })
        }
    }
    return content
}

function replaceMain(fileName:string, langRootPath:string, enDict:string[], toLang:string, outFileName:string) : boolean {
    if (enDict.length == 0){
        return false
    }
    const toDictFileName = path.join(langRootPath, "translate-resources/main_dict_" + toLang + ".txt")
    const toDict = readStringArrayFromFile(toDictFileName)
    if (toDict.length == 0){
        console.log("error in replaceMain, readStringArrayFromFile failed, not found "+ toDictFileName +".")
        return false
    }
    const main_content = replaceLabelsFromFile( fileName, enDict, toDict);
    if (main_content.length>0) {
        fs.writeFileSync( outFileName, main_content )
        return true
    }else{
        console.log("error in replaceMain,  replaceLabelsFromFile failed.")
    }
    return false
}

function replaceRenderer(fileName:string, langRootPath:string, toLang:string, outFileName:string): boolean {
    const toDictFileName = path.join(langRootPath, "translate-resources/renderer_dict_" + toLang + ".txt")
    const toDict = readStringArrayFromFile(toDictFileName)
    if (toDict.length == 0){
        console.log("error in replaceRenderer, readStringArrayFromFile failed, not found "+ toDictFileName +".")
        return false
    }

    if (!fs.existsSync(fileName)) {
        console.log("error in replaceRenderer, not found "+ fileName +".")
        return false
    }

    let content = fs.readFileSync(fileName, "utf-8")

    for (let i = 0; i < toDict.length; i++) {
        if (toDict[i].trim().length > 0) {
            const tow_cell = toDict[i].split('|')
            if (tow_cell.length == 2 ){
                content = content.replace(tow_cell[0], tow_cell[1])
            }
        }
    }

    if (content.length>0) {
        fs.writeFileSync( outFileName, content )
        return true
    }else{
        console.log("error in replaceRenderer,  readFileSync or replace failed.")
    }

    return false
}


function initMainEnDict(fileName:string, langRootPath:string) : string[] {
    const enDictFileName = path.join(langRootPath, "translate-resources/main_dict_en.txt")
    let enDict = readStringArrayFromFile(enDictFileName)

    if (enDict.length==0){
        const excludeDict = readStringArrayFromFile( path.join(langRootPath, "translate-resources/exclude.txt"))
        enDict = searchLabelsFromFile(fileName, excludeDict)
        if (enDict.length>0){
          writeStringArrayToFile(enDictFileName, enDict)
        }
    }

    if (enDict.length==0){
        console.log("error in initMainEnDict, enDict is Empty.")
    }
    return enDict
}

export function markTextAsarTranslate(langRootPath:string, toLang:string, mainJsFileName:string, outMainJsFileName:string, rendererJsFileName:string, outRendererJsFileName:string): void {

    const enDict = initMainEnDict(mainJsFileName, langRootPath)

    if (enDict.length>0){
        if (replaceMain(mainJsFileName, langRootPath,  enDict, toLang, outMainJsFileName)){
            console.log("replaceMain success.")
        }else{
            console.log("replaceMain failed.")
        }
    }

    if (replaceRenderer(rendererJsFileName, langRootPath,  toLang, outRendererJsFileName)){
        console.log("replaceRenderer success.")
    }else{
        console.log("replaceRenderer failed.")
    }
}
