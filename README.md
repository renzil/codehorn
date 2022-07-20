# codehorn
Talk about your code on social media directly from GitHub.

## Development

Install all dependencies (needs Node LTS, yarn).
```bash
yarn
```

Initialise firebase and select the appropriate project for hosting.
```bash
firebase init
```

Serve the project for local development (auto-builds on changes, but does not live reload yet).
```bash
yarn run serve
```

## Deployment

This repository is setup to auto deploy on pushes to main. This is the preferable way to deploy.

To manually deploy, run:
```bash
yarn run deploy
```
