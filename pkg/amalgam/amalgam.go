package amalgam

import (
	"bufio"
	"context"
	"fmt"
	"go/parser"
	"go/token"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/tiktoken-go/tokenizer"

	"github.com/TriangleSide/GoBase/pkg/logger"
)

const (
	GoMod       = "go.mod"
	GoExtension = ".go"
)

var (
	tokenizerCodec          tokenizer.Codec
	allowedExtensions       map[string]struct{}
	disallowedPaths         map[string]struct{}
	disallowedFileNameParts map[string]struct{}
)

func init() {
	var err error
	if tokenizerCodec, err = tokenizer.ForModel(tokenizer.GPT4); err != nil {
		panic("Unable to get tokenizer codec for GPT4 model.")
	}
	allowedExtensions = map[string]struct{}{
		GoExtension: {},
		".md":       {},
		".ts":       {},
		".tsx":      {},
		".html":     {},
		".css":      {},
		".sql":      {},
		".proto":    {},
	}
	disallowedPaths = map[string]struct{}{
		"bin":          {},
		"node_modules": {},
	}
	disallowedFileNameParts = map[string]struct{}{
		"coverage.html": {},
	}
}

type fileContent struct {
	Path    string
	Content string
	Imports []string
	Package string
}

func Get(ctx context.Context, root string) (string, int, error) {
	moduleName, err := getModuleName(ctx, root)
	if err != nil {
		return "", -1, err
	}

	files, err := collectFiles(root)
	if err != nil {
		return "", -1, err
	}

	fileContents, err := readFiles(root, moduleName, files)
	if err != nil {
		return "", -1, err
	}

	orderedFiles := orderFiles(fileContents)

	sb := strings.Builder{}
	for _, fc := range orderedFiles {
		sb.WriteString(fmt.Sprintf("// Start File: %s\n\n%s\n\n// End File: %s\n\n", fc.Path, strings.TrimSpace(fc.Content), fc.Path))
	}

	amalgamStr := sb.String()
	tokenIds, _, err := tokenizerCodec.Encode(amalgamStr)
	if err != nil {
		return amalgamStr, -1, err
	}

	return amalgamStr, len(tokenIds), nil
}

func getModuleName(ctx context.Context, root string) (string, error) {
	goModPath := filepath.Join(root, GoMod)
	file, err := os.Open(goModPath)
	if err != nil {
		return "", fmt.Errorf("error while opening %s (%w)", goModPath, err)
	}
	defer func() {
		if err := file.Close(); err != nil {
			logger.Errorf(ctx, "error while closing go.mod file (%s)", err.Error())
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
		return "", fmt.Errorf("error while reading %s (%w)", goModPath, err)
	}

	return "", fmt.Errorf("go module name not found in %s", goModPath)
}

func collectFiles(root string) ([]string, error) {
	var files []string

	err := filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		pathParts := strings.Split(path, string(filepath.Separator))
		for _, pathPart := range pathParts {
			if _, hasPathPart := disallowedPaths[strings.ToLower(pathPart)]; hasPathPart {
				return nil
			}
		}

		if !info.IsDir() {
			_, file := filepath.Split(path)
			for disallowedFileNamePart := range disallowedFileNameParts {
				if strings.Contains(strings.ToLower(file), strings.ToLower(disallowedFileNamePart)) {
					return nil
				}
			}

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
			return nil, fmt.Errorf("error reading file %s (%w)", file, err)
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
				return nil, fmt.Errorf("error parsing go file (%w)", err)
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
