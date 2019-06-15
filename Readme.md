# Flickgame Updater


## Install

1. Install [NodeJs](https://nodejs.org/en/)
2. Install through `npm`
```bash
npm install -g flickgame-updater
```

## Usage

1. Generate a GitHub personal access token: https://github.com/settings/tokens/new
2. Run flickgame-updater as `watch` mode:
```bash
cd <your_png_files_folder>
flickgame-updater --gist <gist_id> --token <github_token> --watch
```
