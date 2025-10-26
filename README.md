# key-fleet

## Package for Lambda

- Install production dependencies only:
    ```bash
    npm install --production
    ```
- Compile TypeScript:
    ```bash
    npm run build
    ```
- Zip dist/ folder + node_modules:
    ```bash
    zip -r lambda.zip dist node_modules
    ```