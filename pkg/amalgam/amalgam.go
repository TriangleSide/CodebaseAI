package amalgam

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/tiktoken-go/tokenizer"
)

var (
	allowedFiles = map[string]struct{}{
		"Makefile": {},
	}
	allowedExtensions = map[string]struct{}{
		".go":    {},
		".md":    {},
		".ts":    {},
		".tsx":   {},
		".html":  {},
		".css":   {},
		".sql":   {},
		".proto": {},
		".cpp":   {},
		".cc":    {},
		".c":     {},
		".h":     {},
	}
	disallowedPaths = map[string]struct{}{
		"bin":          {},
		"node_modules": {},
	}
	disallowedFileNameParts = map[string]struct{}{
		"coverage.html": {},
	}
)

var (
	tokenizerCodec tokenizer.Codec
)

func init() {
	var err error
	if tokenizerCodec, err = tokenizer.ForModel(tokenizer.GPT4); err != nil {
		panic("Unable to get tokenizer codec for GPT4 model.")
	}
}

type fileContent struct {
	Path    string
	Content string
	Imports []string
	Package string
}

func Get(ctx context.Context, root string) (string, int, error) {
	files, err := collectFiles(root)
	if err != nil {
		return "", -1, err
	}

	fileContents, err := readFiles(root, files)
	if err != nil {
		return "", -1, err
	}

	sb := strings.Builder{}
	for _, fc := range fileContents {
		sb.WriteString(fmt.Sprintf("// Start File: %s\n\n%s\n\n// End File: %s\n\n", fc.Path, strings.TrimSpace(fc.Content), fc.Path))
	}

	amalgamStr := sb.String()
	tokenIds, _, err := tokenizerCodec.Encode(amalgamStr)
	if err != nil {
		return amalgamStr, -1, err
	}

	return amalgamStr, len(tokenIds), nil
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

			if _, ok := allowedFiles[file]; ok {
				files = append(files, path)
				return nil
			}

			ext := filepath.Ext(path)
			if _, ok := allowedExtensions[ext]; ok {
				files = append(files, path)
				return nil
			}
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return files, nil
}

func readFiles(root string, files []string) ([]fileContent, error) {
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

		fileContents = append(fileContents, fc)
	}

	return fileContents, nil
}
