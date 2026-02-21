.PHONY: help install dev build test test-watch test-ui test-coverage type-check lint clean deploy

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	pnpm install

dev: ## Start development server
	pnpm dev

build: ## Build for production
	pnpm build

test: ## Run tests (fast)
	pnpm test

test-watch: ## Run tests in watch mode
	pnpm test:watch

test-ui: ## Run tests with UI
	pnpm test:ui

test-coverage: ## Run tests with coverage report
	pnpm test:coverage

type-check: ## Run TypeScript type checking
	pnpm type-check

lint: type-check ## Run type checking (linter placeholder)
	@echo "✓ Type checking passed"

clean: ## Remove generated files
	rm -rf docs/ node_modules/.vite coverage/

deploy: test build ## Test, build, and deploy to GitHub Pages
	git add docs/
	git commit -m "Deploy: production build with test coverage $(shell date +%Y-%m-%d)" || echo "No changes to commit"
	git push
	@echo "✓ Deployed to https://vincenthofmann-ai.github.io/report-builder-addin/"
