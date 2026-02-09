import {CommandRegistry} from "@lumino/commands";
import {paperPlaneIcon} from "./icons";
import {LabIcon} from "@jupyterlab/ui-components";
import {INotebookTracker, NotebookPanel} from "@jupyterlab/notebook";
import {ServerConnection} from "@jupyterlab/services";
import {URLExt} from "@jupyterlab/coreutils";
import {PanelLayout} from "@lumino/widgets";
import {ToolbarLabelComponent} from "./toolbarLabel";
import IProps = ToolbarLabelComponent.IProps;
import {SUBMIT_COMMAND_ID} from "./index";

const COURSE_API_PATH = 'courses';
const ASSIGNMENT_API_PATH = 'assignments';
const SUBMIT_NOTEBOOK_API_PATH = 'assignments/submit';

export interface NbGraderNotebook {
  notebook_id: string,
  path: string
}

export interface NbGraderAssignment {
  course_id: string,
  assignment_id: string,
  status: 'released' | 'fetched',
  path: string,
  notebooks: NbGraderNotebook[]
}

export class SubmitCommand implements CommandRegistry.ICommandOptions {
  label: string = 'Submit';
  caption: string = 'Submit notebook';
  icon: LabIcon =  paperPlaneIcon;
  iconClass: string = 'reduce-icon-size';
  _fetchedAssignments: NbGraderAssignment[] = [];
  private tracker?: INotebookTracker;
  static instanceId: number = 0;

  constructor(notebookTracker: INotebookTracker) {
    this.tracker = notebookTracker;
    this.tracker.widgetAdded.connect((tracker: INotebookTracker, widget: NotebookPanel) => {
      this.loadFetchedAssignments().then(() => {
        (widget.toolbar.layout as PanelLayout).widgets.forEach(toolbarItemWidget => {
          if(((toolbarItemWidget as any)['props'] as IProps)?.id === SUBMIT_COMMAND_ID) toolbarItemWidget.update();
        });
      });
    });
  }

  isEnabled = (): boolean => {
    console.log('isEnabled() was called', this.tracker?.currentWidget?.context.localPath, JSON.stringify(this._fetchedAssignments));
    return !!this.findAssignment(this.tracker?.currentWidget?.context.localPath ?? '');
  }

  private getCurrentNotebookPath = (): string | undefined => {
    return this.tracker?.currentWidget?.context.localPath;
  }

  private async loadFetchedAssignments(): Promise<void>{
    this._fetchedAssignments = [];
    await this.fetchCourses()
      .then(async courses => Promise.all(
        courses.map(async courseId => {
          await this.fetchAssignments(courseId)
              .then(assignments => {
                this._fetchedAssignments.push(...(assignments.filter(assignment => assignment.status === 'fetched')));
              });
        })
      ));
    console.log(this._fetchedAssignments);
  }

  private async fetchCourses(): Promise<string[]>{
    const settings = ServerConnection.makeSettings();
    const requestUrl = URLExt.join(settings.baseUrl,COURSE_API_PATH);

    return ServerConnection.makeRequest(requestUrl, {}, settings)
      .then(async (response) => {
         return (await response.json()).value;
      })
      .catch(error => {
        throw new ServerConnection.NetworkError(error as TypeError);
      });
  }

  private async fetchAssignments(courseId: string): Promise<NbGraderAssignment[]>{
    const settings = ServerConnection.makeSettings();
    const requestUrl = URLExt.join(settings.baseUrl,ASSIGNMENT_API_PATH,'?course_id='+encodeURIComponent(courseId));

    return ServerConnection.makeRequest(requestUrl, {}, settings)
      .then(async (response) => {
         return (await response.json()).value;
      })
      .catch(error => {
        throw new ServerConnection.NetworkError(error as TypeError);
      });
  }

  private findAssignment = (path: string): NbGraderAssignment | undefined => {
    return this._fetchedAssignments.find(assignment => assignment.notebooks.some(notebook => notebook.path === path));
  }

  execute = async (): Promise<void> => {
    const notebookPath: string | undefined = this.getCurrentNotebookPath();
    if(!notebookPath){
      console.warn("unable to identify the current notebook's path -> unable to submit");
      return;
    }
    const assignment: NbGraderAssignment | undefined = this.findAssignment(notebookPath);
    if(!assignment){
      console.warn("notebook seems not to be part of any assignment -> unable to submit");
      return;
    }
    const dataToSend = { course_id: assignment.course_id, assignment_id: assignment.assignment_id };

    const settings = ServerConnection.makeSettings();
    const requestUrl = URLExt.join(settings.baseUrl, SUBMIT_NOTEBOOK_API_PATH);

    await ServerConnection.makeRequest(requestUrl, {method: 'POST', body: JSON.stringify(dataToSend)}, settings)
      .then(async (response) => {
        console.log('notebook has been submitted');
        console.log(await response.json());
      })
      .catch(error => {
        throw new ServerConnection.NetworkError(error as TypeError);
      });
  }
}