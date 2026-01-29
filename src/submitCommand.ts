import {CommandRegistry} from "@lumino/commands";
import {paperPlaneIcon} from "./icons";
import {LabIcon} from "@jupyterlab/ui-components";
import {INotebookTracker} from "@jupyterlab/notebook";
import {ServerConnection} from "@jupyterlab/services";
import {URLExt} from "@jupyterlab/coreutils";

const COURSE_API_PATH = 'courses';
const ASSIGNMENT_API_PATH = 'assignments';

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
    console.log('instance', SubmitCommand.instanceId++);
    this.tracker = notebookTracker;
    const that = this;
    notebookTracker.currentChanged.connect(async () => {
      console.log('widget focused', that.tracker?.currentWidget);
      await this.loadFetchedAssignments();
      console.log(this._fetchedAssignments);
    });
  }

  isEnabled = (): boolean => {
    console.log(this.tracker?.currentWidget?.context.localPath);
    return this._fetchedAssignments.some(assignment => assignment.notebooks.some(notebook => notebook.path === this.tracker?.currentWidget?.context.localPath));
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

  async execute(): Promise<void> {
    /*const dataToSend = { course_id: '', assignment_id: '' };
    try {
      const reply = await requestAPI<any>('assignments/submit', {
        body: JSON.stringify(dataToSend),
        method: 'POST'
      });

      if(!reply.success){
        that.submit_error(reply);
        button.innerText = 'Submit'
        button.removeAttribute('disabled')
      }else{
        that.on_refresh(reply);
      }

    } catch (reason) {
      remove_children(container);
      container.innerText = 'Error submitting assignment.';
      console.error(
        `Error on POST /assignment_list/assignments/submit ${dataToSend}.\n${reason}`
      );
    }*/
  }
}