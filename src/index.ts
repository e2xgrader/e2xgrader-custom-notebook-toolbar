import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import {
  INotebookWidgetFactory,
  NotebookWidgetFactory,
  NotebookPanel
}  from '@jupyterlab/notebook';
import {
  IEditorServices
} from '@jupyterlab/codeeditor';
import {
  IRenderMimeRegistry
} from '@jupyterlab/rendermime';
import {
  ISessionContextDialogs,
  IToolbarWidgetRegistry,
  ToolbarWidgetRegistry
} from '@jupyterlab/apputils';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { ITranslator } from '@jupyterlab/translation';

import {activateWidgetFactory} from "./widgetFactory";
import {createDefaultFactory} from "./toolbarRegistry";

/**
 * Initialization data for the @e2xgrader/custom-notebook-toolbar:widget-factory extension.
 */
const widgetFactory: JupyterFrontEndPlugin<NotebookWidgetFactory.IFactory> = {
  id: '@e2xgrader-extension/replace-notebook-widget-factory:widget-factory',
  description: 'A JupyterLab that replaces the native notebook-widget-factory extension to achieve an empty notebook toolbar.',
  provides: INotebookWidgetFactory,
  requires: [
    NotebookPanel.IContentFactory,
    IEditorServices,
    IRenderMimeRegistry,
    IToolbarWidgetRegistry
  ],
  optional: [ISettingRegistry, ISessionContextDialogs, ITranslator],
  activate: activateWidgetFactory,
  autoStart: true
};

/**
 * Initialization data for the @e2xgrader/custom-notebook-toolbar:toolbar-registry extension.
 */
export const toolbarRegistry: JupyterFrontEndPlugin<IToolbarWidgetRegistry> = {
  id: '@e2xgrader/custom-notebook-toolbar:toolbar-registry',
  description: 'Provides toolbar items registry.',
  autoStart: true,
  provides: IToolbarWidgetRegistry,
  activate: (app: JupyterFrontEnd) => {
    const registry = new ToolbarWidgetRegistry({
      defaultFactory: createDefaultFactory(app.commands)
    });
    return registry;
  }
};


/**
 * Export the plugins as default.
 */
const plugins: JupyterFrontEndPlugin<any>[] = [
  widgetFactory,
  toolbarRegistry
];
export default plugins;
