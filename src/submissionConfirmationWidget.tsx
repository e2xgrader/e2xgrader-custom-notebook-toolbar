import {ReactWidget} from "@jupyterlab/apputils";
import {JSX} from "react/jsx-runtime";
import * as React from 'react';

export const SUBMISSION_CONFIRMATION_CLASS = 'e2x-submission-confirmation';
export const SUBMISSION_TIMESTAMP_CLASS = 'e2x-submission-timestamp';

export class SubmissionConfirmationWidget extends ReactWidget {
    constructor(private timestamp: string) {
        super();
    }

    render(): JSX.Element{
        return (
            <div className={SUBMISSION_CONFIRMATION_CLASS}>
                Your submission was received at:
                <div className={SUBMISSION_TIMESTAMP_CLASS}>{this.timestamp}</div>
                <b>Are you done working on your exam?</b><br/>
                The hashcode will be displayed after exiting the exam.
            </div>
        );
    }
}