# source-merge

[source-merge](https://github.com/your-username/source-merge) is a command-line tool written in TypeScript that recursively scans one or more input folders, processes files with specified extensions, removes comments from the content, and merges the cleaned content into a single output file. It supports multiple programming languages by handling common comment syntaxes. The merged output can be fed into GPT-based tools (such as ChatGPT) to help clarify, improve, or extend your code while preserving context.

## Features

- **Recursive File Processing:** Scans directories recursively for files.
- **Customizable Exclusions:** Exclude specific folders via a configuration file or command-line arguments.
- **Extension Filtering:** Only process files with allowed extensions (configurable via `config.json` or command-line).
- **Comment Removal:** Supports comment removal for multiple languages:
  - JavaScript, PHP, CSS (`/* ... */` and `// ...`)
  - Python, Shell, Ruby (`# ...`)
  - HTML, XML (`<!-- ... -->`)
- **Dynamic Output Naming:** Generates an output file name with a timestamp, ensuring unique merged files.

## Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/your-username/source-merge.git
   cd source-merge
   ```

2. **Install Dependencies**

   Make sure you have [Node.js](https://nodejs.org/) installed, then run:

   ```bash
   npm install
   ```

3. **Build the Project**

   If you're using TypeScript, compile the project:

   ```bash
   npm run build
   ```

   *(Ensure your `tsconfig.json` is set up correctly.)*

## Configuration

The tool uses a `config.json` file located one directory above the script file. This file should define default values for the following properties:

```json
{
  "excludePatterns": ["node_modules", ".git"],
  "allowedExtensions": [".js", ".ts", ".py", ".php", ".css", ".html", ".xml", ".sh", ".rb"]
}
```

- **excludePatterns:** Folders or file path segments to exclude during processing.
- **allowedExtensions:** List of file extensions to include. You can override this list via the command line.

## Usage

After building, you can run the tool via Node.js. The tool accepts several command-line arguments:

- `--input`: **(Required)** Comma-separated list of input folder paths.
- `--exclude`: Additional comma-separated folder patterns to exclude (merged with those from `config.json`).
- `--extensions`: Comma-separated list of allowed file extensions (overrides `config.json`).
- `--output`: Specify the output file name. If omitted, the tool creates one automatically using the format `merged-<timestamp>.txt` inside an `output` folder.

### Examples

1. **Basic Usage:**

   ```bash
   node dist/index.js --input="src,lib"
   ```

   This will merge files from the `src` and `lib` directories using the defaults specified in `config.json`.

2. **Specifying Exclusions and Extensions:**

   ```bash
   node dist/index.js --input="src" --exclude="tests,docs" --extensions=".js,.ts"
   ```

   This will process only `.js` and `.ts` files from the `src` folder, additionally excluding folders that include "tests" or "docs".

3. **Custom Output File:**

   ```bash
   node dist/index.js --input="src" --output="./merged/combined.txt"
   ```

   This writes the merged output into the specified file.

## How It Works

1. **Configuration Loading:**  
   The tool begins by loading `config.json` to set default exclusion patterns and allowed file extensions.

2. **Parsing Arguments:**  
   It uses [minimist](https://www.npmjs.com/package/minimist) to parse command-line arguments, allowing overrides for exclusions and file extensions.

3. **File Processing:**  
   - Recursively scans the specified input folders.
   - Skips files or folders based on exclusion patterns.
   - Reads each file, removes comments based on its extension, and ignores files that become empty after processing.
   - Prepends a header (using `### <relative-path>`) for each file in the merged output.

4. **Output Generation:**  
   The cleaned and merged content is written to the output file, which is either user-specified or auto-generated.

## Contributing

Contributions are welcome! Please feel free to open issues or pull requests for enhancements or bug fixes.

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them.
4. Open a pull request.

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

For questions or feedback, please open an issue in the GitHub repository.