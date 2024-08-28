package amalgam

import (
	"bufio"
	"fmt"
	"go/parser"
	"go/token"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/sirupsen/logrus"
)

const (
	GoMod = "go.mod"

	GoExtension       = ".go"
	MarkdownExtension = ".md"
)

var (
	allowedExtensions map[string]struct{}
)

func init() {
	allowedExtensions = map[string]struct{}{
		GoExtension:       {},
		MarkdownExtension: {},
	}
}

type fileContent struct {
	Path    string
	Content string
	Imports []string
	Package string
}

func Get(root string) (string, error) {
	moduleName, err := getModuleName(root)
	if err != nil {
		return "", err
	}

	files, err := collectFiles(root)
	if err != nil {
		return "", err
	}

	fileContents, err := readFiles(root, moduleName, files)
	if err != nil {
		return "", err
	}

	orderedFiles := orderFiles(fileContents)

	sb := strings.Builder{}
	for _, fc := range orderedFiles {
		sb.WriteString(fmt.Sprintf("// Start File: %s\n\n%s\n\n// End File: %s\n\n", fc.Path, strings.TrimSpace(fc.Content), fc.Path))
	}

	return sb.String(), nil
}

func getModuleName(root string) (string, error) {
	goModPath := filepath.Join(root, GoMod)
	file, err := os.Open(goModPath)
	if err != nil {
		return "", fmt.Errorf("error while opening %s (%s)", goModPath, err.Error())
	}
	defer func() {
		if err := file.Close(); err != nil {
			logrus.Errorf("error while closing go.mod file (%s)", err.Error())
		}
	}()

	const modulePrefix = "module "
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if strings.HasPrefix(line, modulePrefix) {
			moduleName := strings.TrimPrefix(line, modulePrefix)
			return moduleName, nil
		}
	}

	if err := scanner.Err(); err != nil {
		return "", fmt.Errorf("error while reading %s (%s)", goModPath, err.Error())
	}

	return "", fmt.Errorf("go module name not found in %s", goModPath)
}

func collectFiles(root string) ([]string, error) {
	var files []string
	err := filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if !info.IsDir() {
			ext := filepath.Ext(path)
			if _, ok := allowedExtensions[ext]; ok {
				files = append(files, path)
			}
		}
		return nil
	})

	if err != nil {
		return nil, err
	}

	return files, nil
}

func readFiles(root string, moduleName string, files []string) ([]fileContent, error) {
	var fileContents []fileContent

	for _, file := range files {
		content, err := os.ReadFile(file)
		if err != nil {
			return nil, fmt.Errorf("error reading file %s (%s)", file, err.Error())
		}

		relativePath, err := filepath.Rel(root, file)
		if err != nil {
			panic(fmt.Errorf("error getting relative path for file %s and root %s", file, root))
		}

		fc := fileContent{
			Path:    relativePath,
			Content: string(content),
			Imports: make([]string, 0),
			Package: "",
		}

		if filepath.Ext(file) == GoExtension {
			fset := token.NewFileSet()
			node, err := parser.ParseFile(fset, file, content, parser.ImportsOnly)
			if err != nil {
				return nil, fmt.Errorf("error parsing go file (%s)", err.Error())
			}

			for _, imp := range node.Imports {
				importPath := imp.Path.Value
				importPath = importPath[1 : len(importPath)-1] // Remove quotes
				if strings.HasPrefix(importPath, moduleName) {
					cleanedImportPath := strings.TrimPrefix(importPath, moduleName)
					cleanedImportPath = strings.TrimPrefix(cleanedImportPath, string(filepath.Separator))
					cleanedImportPath = filepath.Clean(cleanedImportPath)
					fc.Imports = append(fc.Imports, cleanedImportPath)
				}
			}

			if node.Name != nil {
				fc.Package = node.Name.Name
			}
		}

		fileContents = append(fileContents, fc)
	}

	return fileContents, nil
}

func orderFiles(fileContents []fileContent) []fileContent {
	sort.Slice(fileContents, func(i, j int) bool {
		return strings.Compare(fileContents[i].Path, fileContents[j].Path) < 0
	})

	folderToFiles := make(map[string][]fileContent)
	for _, fc := range fileContents {
		dirPath := filepath.Dir(fc.Path)
		if _, ok := folderToFiles[dirPath]; !ok {
			folderToFiles[dirPath] = make([]fileContent, 0)
		}
		folderToFiles[dirPath] = append(folderToFiles[dirPath], fc)
	}

	sorted := make([]fileContent, 0)
	seenPath := make(map[string]struct{})

	var visit func(fc fileContent)
	visit = func(fc fileContent) {
		// Seen memo. Only visit a unique path once.
		if _, ok := seenPath[fc.Path]; ok {
			return
		}
		seenPath[fc.Path] = struct{}{}

		// Visit all dependencies first.
		for _, imp := range fc.Imports {
			for _, dirFc := range folderToFiles[imp] {
				visit(dirFc)
			}
		}

		// Visit all files in this directory before adding it.
		dirPath := filepath.Dir(fc.Path)
		for _, dirFc := range folderToFiles[dirPath] {
			visit(dirFc)
		}

		// Dependencies all have been added, so add this one next.
		sorted = append(sorted, fc)
	}

	for _, fc := range fileContents {
		visit(fc)
	}

	return sorted
}
