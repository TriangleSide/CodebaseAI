package amalgam

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/tiktoken-go/tokenizer"

	"github.com/TriangleSide/CodebaseAI/pkg/config"
	baseconfig "github.com/TriangleSide/GoTools/pkg/config"
	"github.com/TriangleSide/GoTools/pkg/logger"
)

var (
	allowedExactFiles    = make(map[string]struct{})
	allowedSuffix        = make(map[string]struct{})
	disallowedExactPaths = make(map[string]struct{})
	disallowedSuffix     = make(map[string]struct{})
)

var (
	tokenizerCodec tokenizer.Codec
)

type fileContent struct {
	Path    string
	Content string
	Imports []string
	Package string
}

func init() {
	cfg, err := baseconfig.ProcessAndValidate[config.Config]()
	if err != nil {
		logger.Fatalf("Failed to read the configuration (%s)", err.Error())
	}
	if tokenizerCodec, err = tokenizer.ForModel(tokenizer.Model(cfg.ModelVersion)); err != nil {
		logger.Fatalf("Unable to get tokenizer codec for %s model.", cfg.ModelVersion)
	}
	loadConfig("amalgam.json")
}

func loadConfig(filepath string) {
	data, err := os.ReadFile(filepath)
	if err != nil {
		log.Fatalf("Error reading config file: %v", err)
	}

	type AmalgamConfig struct {
		AllowedExactFiles    []string `json:"allowedExactFiles"`
		AllowedSuffix        []string `json:"allowedSuffix"`
		DisallowedExactPaths []string `json:"disallowedExactPaths"`
		DisallowedSuffix     []string `json:"disallowedSuffix"`
	}
	var amalgamConfig AmalgamConfig

	if err = json.Unmarshal(data, &amalgamConfig); err != nil {
		log.Fatalf("Error unmarshalling JSON: %v", err)
	}

	for _, file := range amalgamConfig.AllowedExactFiles {
		allowedExactFiles[file] = struct{}{}
	}
	for _, suffix := range amalgamConfig.AllowedSuffix {
		allowedSuffix[suffix] = struct{}{}
	}
	for _, path := range amalgamConfig.DisallowedExactPaths {
		disallowedExactPaths[path] = struct{}{}
	}
	for _, suffix := range amalgamConfig.DisallowedSuffix {
		disallowedSuffix[suffix] = struct{}{}
	}
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
		sb.WriteString(fmt.Sprintf("// File: %s\n\n%s\n\n", fc.Path, strings.TrimSpace(fc.Content)))
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
			if _, hasPathPart := disallowedExactPaths[strings.ToLower(pathPart)]; hasPathPart {
				return nil
			}
		}

		if !info.IsDir() {
			_, file := filepath.Split(path)
			for disallowed := range disallowedSuffix {
				if strings.HasSuffix(strings.ToLower(file), strings.ToLower(disallowed)) {
					return nil
				}
			}

			if _, ok := allowedExactFiles[file]; ok {
				files = append(files, path)
				return nil
			}

			ext := filepath.Ext(path)
			if _, ok := allowedSuffix[ext]; ok {
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
