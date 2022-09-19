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

function replaceLabelsFromFile( fileName:string, toDict: string[]) : string {
    let content:string = ""
    let toKeys:string[] = []
    let toVals:string[] = []
    for (let i = 0; i < toDict.length; i++) {
      if (toDict[i].trim().length > 0) {
        const tow_cell = toDict[i].split('|')
        if (tow_cell.length == 2 ){
          toKeys.push(tow_cell[0])
          toVals.push(tow_cell[1])
        }
      }
    }
    if (fs.existsSync(fileName)) {
        let buffer = fs.readFileSync(fileName, "utf-8")
        let pat = /(label):"(.*?)"/gms
        content = buffer.replace(pat, (match, key, value) => {
            const idx = toKeys.indexOf(value)
            if (idx != -1) {
                return key + ':"' + toVals[idx] + '"'
            }
            return match
        })
    }

    return content
}

function replaceMainLabelDict(fileName:string, langRootPath:string, toDict:string[], toLang:string, outFileName:string) : boolean {
    if (toDict.length == 0){
        return false
    }
    const main_content = replaceLabelsFromFile( fileName, toDict);
    if (main_content.length>0) {
        fs.writeFileSync( outFileName, main_content )
        return true
    }else{
        console.log("error in replaceMainLabelDict,  replaceLabelsFromFile failed.")
    }
    return false
}


function replaceMain(fileName:string, langRootPath:string, toLang:string, outFileName:string): boolean {
  const toDictFileName = path.join(langRootPath, "translate-resources/main_dict_" + toLang + ".txt")
  const toDict = readStringArrayFromFile(toDictFileName)
  if (toDict.length == 0){
    console.log("error in replaceMain, readStringArrayFromFile failed, not found "+ toDictFileName +".")
    return false
  }

  if (!fs.existsSync(fileName)) {
    console.log("error in replaceMain, not found "+ fileName +".")
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
    console.log("error in replaceMain,  readFileSync or replace failed.")
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


function initMainLabelDict(fileName:string, langRootPath:string, toLang:string) : string[] {

    const toDictFileName = path.join(langRootPath, "translate-resources/main_label_dict_" + toLang + ".txt")
    let toDict = readStringArrayFromFile(toDictFileName)
    let toKeys:string[] = []
    for (let i = 0; i < toDict.length; i++) {
      if (toDict[i].trim().length > 0) {
        const tow_cell = toDict[i].split('|')
        if (tow_cell.length == 2 ){
          toKeys.push(tow_cell[0])
        }
      }
    }

    const excludeDict = readStringArrayFromFile( path.join(langRootPath, "translate-resources/exclude.txt"))
    let enDict = searchLabelsFromFile(fileName, excludeDict)
    if (enDict.length>0){
      let nAdd = 0
      for (let i=0; i<enDict.length; i++){
        if (toKeys.indexOf(enDict[i]) == -1){
          toDict.push(enDict[i]+'|'+enDict[i])
          toKeys.push(enDict[i])
          nAdd++
        }
      }
      if (nAdd!=0){
        //UI Label change, need to rewrite.
        writeStringArrayToFile(toDictFileName, toDict)
      }
    }

    if (toDict.length==0){
        console.log("warring in initMainLabelDict, toDict is Empty.")
    }
    return toDict
}

export function markTextAsarTranslate(langRootPath:string, toLang:string, mainJsFileName:string, outMainJsFileName:string, rendererJsFileName:string, outRendererJsFileName:string): boolean {

  const toDict = initMainLabelDict(mainJsFileName, langRootPath, toLang)

  if (toDict.length>0){
    if (replaceMainLabelDict(mainJsFileName, langRootPath,  toDict, toLang, outMainJsFileName)){
      console.log("replaceMainLabelDict success.")
    }else{
      console.log("replaceMainLabelDict failed.")
      return false
    }
  }

  if (replaceMain(mainJsFileName, langRootPath,  toLang, outMainJsFileName)){
    console.log("replaceMain success.")
  }else{
    console.log("replaceMain failed.")
    return false
  }

  if (replaceRenderer(rendererJsFileName, langRootPath,  toLang, outRendererJsFileName)){
    console.log("replaceRenderer success.")
  }else{
    console.log("replaceRenderer failed.")
    return false
  }
  return true
}
