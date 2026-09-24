.PHONY: help js ts clean

JS_FILE ?= index.js
TS_FILE ?= typescript/index.ts
TS_OUT_DIR ?= dist
TS_OUT_FILE := $(TS_OUT_DIR)/$(notdir $(basename $(TS_FILE))).js

help:
	@echo "make js JS_FILE=path/to/file.js"
	@echo "make ts [TS_FILE=path/to/file.ts]"

js:
	node $(JS_FILE)

ts:
	npx tsc $(TS_FILE) --outDir $(TS_OUT_DIR)
	node $(TS_OUT_FILE)

clean:
	rm -rf $(TS_OUT_DIR)