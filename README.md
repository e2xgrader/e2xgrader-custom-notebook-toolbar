# e2xgrader_custom_notebook_toolbar

[![Github Actions Status](https://github.com/e2xgrader/e2xgrader-custom-notebook-toolbar/workflows/Build/badge.svg)](https://github.com/e2xgrader/e2xgrader-custom-notebook-toolbar/actions/workflows/build.yml)

A JupyterLab extension, that replaces parts of the original notebook-toolbar implementation to create a basic blank-slate toolbar.

This extension contains two plugins:
- The first one replaces jupyterlabs original NotebookWidgetFactory. This was done to replace the original notebook panel
  JSON schema, which defines the notebook's default toolbar items. This replacement NotebookWidgetFactory reduces the predefined 
  toolbar-items to a minimum, to provide a blank slate.
    - if the current set of basic toolbar-entries should be altered (reduced / changed / extended), this can be done by
      reconfiguring `schema/panel.json` in this repository.
- The second plugin wraps jupyterlabs defaultWidgetFactory, to enable more JSON-defined toolbar items. Besides the original
  CommandButton and Spacer items, a toolbar-Label has been added. A toolbar label can be defined via JSON like this:
  ```json
    { 
      "name": "branding",
      "type": "label",
      "label": "e²x",
      "caption": "e²xgrader custom toolbar",
      "rank": 0
    }
  ```
  `label`, `caption` and `icon` are each optional attributes. Please make sure to specify at least a label or an icon.

## Requirements

- JupyterLab >= 4.0.0

## Install

To install the extension, execute:

```bash
pip install e2xgrader_custom_notebook_toolbar
```

## Uninstall

To remove the extension, execute:

```bash
pip uninstall e2xgrader_custom_notebook_toolbar
```

## Contributing

### Development install

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the e2xgrader_custom_notebook_toolbar directory

# Set up a virtual environment and install package in development mode
python -m venv .venv
source .venv/bin/activate
pip install --editable "."

# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite

# Rebuild extension Typescript source after making changes
# IMPORTANT: Unlike the steps above which are performed only once, do this step
# every time you make a change.
jlpm build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm watch
# Run JupyterLab in another terminal
jupyter lab
```

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

By default, the `jlpm build` command generates the source maps for this extension to make it easier to debug using the browser dev tools. To also generate source maps for the JupyterLab core extensions, you can run the following command:

```bash
jupyter lab build --minimize=False
```

### Development uninstall

```bash
pip uninstall e2xgrader_custom_notebook_toolbar
```

In development mode, you will also need to remove the symlink created by `jupyter labextension develop`
command. To find its location, you can run `jupyter labextension list` to figure out where the `labextensions`
folder is located. Then you can remove the symlink named `@e2xgrader/custom-notebook-toolbar` within that folder.

### Testing the extension

#### Frontend tests

This extension is using [Jest](https://jestjs.io/) for JavaScript code testing.

To execute them, execute:

```sh
jlpm
jlpm test
```

#### Integration tests

This extension uses [Playwright](https://playwright.dev/docs/intro) for the integration tests (aka user level tests).
More precisely, the JupyterLab helper [Galata](https://github.com/jupyterlab/jupyterlab/tree/master/galata) is used to handle testing the extension in JupyterLab.

More information are provided within the [ui-tests](./ui-tests/README.md) README.

### Packaging the extension

See [RELEASE](RELEASE.md)
