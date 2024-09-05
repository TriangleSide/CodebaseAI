# CodebaseAI

CodebaseAI is designed to help you perform AI inference on your entire GoLang codebase. It leverages OpenAI's GPT models to provide insights and recommendations based on the content of your codebase.

## Prerequisites

### GoLang

Go to https://go.dev/doc/install to install GoLang.

### OpenAI API Key

Go to https://platform.openai.com/account/api-keys and get a key.

### Node.js and NPM

Go to https://nodejs.org/en/download/ and follow the instructions.

## Running the Project

This project is composed of a backend API and some front-end components.

### Backend

Export the following environment variables to run the project:

```shell
export API_KEY=your_openai_api_key
```

Run the API using go in terminal:

```shell
go run cmd/server/main.go
```

### Frontend

Run the following in a separate terminal:

```shell
npm install
npm start
```
