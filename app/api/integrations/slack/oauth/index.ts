import {
    getSlackCredentialByEmail,
    insertSlackCredential,
    SlackCredential,
    updateSlackCredential
} from "@/app/utlities/slack-sqlite-utils";
import {uuidv4} from "uuidv7";
import {insertDriveCredential, updateDriveCredential} from "@/app/utlities/drive-sqlite-utils";

type Credential = {
    email: string,
    access_token: string,
    incoming_webhook_url: string
}
export function loadSlackCredentials(body: Credential){
    if(!body.access_token) return;
    const slackCredential: SlackCredential = {
        id: uuidv4(),
        email: body.email,
        access_token: body.access_token,
        incoming_webhook: body.incoming_webhook_url
    }
    getSlackCredentialByEmail(body.email).then((rec) => {
        if(rec.length === 0){
            console.log("creating");
            insertSlackCredential(slackCredential).then(() => {
                console.log("Credential created for: " +slackCredential.email);
            });
        } else {
            console.log("updating")
            updateSlackCredential(slackCredential).then(() => {
                console.log("Credential updated for: " + slackCredential.email);
            })
        }
    })
}