"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const minimist = require('minimist');
// Load config.json
const configPath = path.join(__dirname, '../config.json');
if (!fs.existsSync(configPath)) {
    console.error("❌ Config file not found!");
    process.exit(1);
}
const config = fs.readJSONSync(configPath);
// ✅ Parse command-line arguments
const args = minimist(process.argv.slice(2));
console.log(process.argv); // @TODO: remove this
console.log({ args }); // @TODO: remove this
// ✅ Get input folders
const inputFolders = typeof args.input === "string" ? args.input.split(",") : [];
// ✅ Get excluded folders (from `config.json` + `--exclude` argument)
const excludedFolders = args.exclude
    ? config.excludePatterns.concat(args.exclude.split(",").map((folder) => folder.trim()))
    : config.excludePatterns;
// Normalize paths
excludedFolders.forEach((folder, index) => {
    excludedFolders[index] = path.normalize(folder);
});
// ✅ Get allowed file extensions (default from `config.json`, override via `--extensions`)
const allowedExtensions = args.extensions
    ? args.extensions.split(",").map((ext) => ext.trim().toLowerCase())
    : config.allowedExtensions;
console.log(`🔍 Allowed Extensions: ${allowedExtensions.join(", ")}`);
console.log(`🚫 Excluded Folders: ${excludedFolders.join(", ")}`);
// ✅ Generate output file name
function generateOutputFilename() {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-T:]/g, "").split(".")[0];
    return `./output/merged-${timestamp}.txt`;
}
const outputFile = typeof args.output === "string" ? args.output : generateOutputFilename();
// Ensure at least one input folder is provided
if (inputFolders.length === 0) {
    console.error("❌ No input folders specified! Use --input=\"folder1,folder2\".");
    process.exit(1);
}
// Ensure output directory exists
fs.ensureDirSync(path.dirname(outputFile));
function isExcluded(filePath, patterns) {
    return patterns.some(pattern => filePath.includes(pattern));
}
function isAllowedExtension(filePath, allowedExtensions) {
    return allowedExtensions.includes(path.extname(filePath));
}
/**
 * Removes comments from multiple languages.
 */
function removeComments(content, filePath) {
    const ext = path.extname(filePath);
    if ([".js", ".php", ".css"].includes(ext)) {
        content = content.replace(/\/\*[\s\S]*?\*\//g, ''); // Remove `/* */`
        content = content.replace(/^.*?\/\/.*$/gm, ''); // Remove `//`
    }
    else if ([".py", ".sh", ".rb"].includes(ext)) {
        content = content.replace(/^.*?#.*$/gm, ''); // Remove `#`
    }
    else if ([".html", ".xml"].includes(ext)) {
        content = content.replace(/<!--[\s\S]*?-->/g, ''); // Remove `<!-- -->`
    }
    return content;
}
/**
 * Recursively gets all files from a directory while excluding specified patterns.
 */
function getFilesFromDirectory(dir, excludePatterns) {
    let fileList = [];
    try {
        const items = fs.readdirSync(dir);
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            if (isExcluded(fullPath, excludePatterns))
                continue;
            if (stat.isDirectory()) {
                fileList = fileList.concat(getFilesFromDirectory(fullPath, excludePatterns));
            }
            else {
                fileList.push(fullPath);
            }
        }
    }
    catch (error) {
    }
    return fileList;
}
let filesToRead = [];
for (const folder of inputFolders) {
    if (fs.existsSync(folder)) {
        filesToRead = filesToRead.concat(getFilesFromDirectory(folder, excludedFolders));
    }
}
let mergedData = "";
let processedFileCount = 0;
for (const filePath of filesToRead) {
    if (fs.existsSync(filePath)) {
        try {
            // ✅ Skip files with extensions not in allowedExtensions
            if (!isAllowedExtension(filePath, allowedExtensions))
                continue;
            let content = fs.readFileSync(filePath, 'utf-8').trim();
            content = removeComments(content, filePath);
            // ✅ Skip empty files after comment removal
            if (content.length === 0)
                continue;
            // ✅ Remove empty lines
            content = content.split("\n").filter(line => line.trim().length > 0).join("\n");
            // ✅ Get relative path from input folder
            let relativePath = filePath;
            for (const folder of inputFolders) {
                if (filePath.startsWith(folder)) {
                    relativePath = filePath.replace(folder, "").replace(/\\/g, "/");
                    break;
                }
            }
            // ✅ Add file header comment with "###" instead of "####"
            mergedData += `### ${relativePath}\n`;
            mergedData += content + "\n\n";
            processedFileCount++;
        }
        catch (error) {
        }
    }
}
// Write merged content to output file
try {
    fs.writeFileSync(outputFile, mergedData);
    console.log(`✅ ${processedFileCount} files processed.`);
    console.log(`📂 Merged data saved at: ${outputFile}`);
}
catch (error) {
}
