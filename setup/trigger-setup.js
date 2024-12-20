import { envvars, configure } from "@trigger.dev/sdk/v3";
import 'dotenv/config';

configure({
    secretKey: process.env.TRIGGER_SECRET_KEY // starts with tr_dev_ or tr_prod_
});

await envvars.create(process.env.TRIGGER_PROJECT_REF, process.env.TRIGGER_ENV, {
    name: "PGUSER",
    value: process.env.PGUSER
});
await envvars.create(process.env.TRIGGER_PROJECT_REF, process.env.TRIGGER_ENV, {
    name: "PGPASSWORD",
    value: process.env.PGPASSWORD
});
await envvars.create(process.env.TRIGGER_PROJECT_REF, process.env.TRIGGER_ENV, {
    name: "PGHOST",
    value: process.env.PGHOST
});
await envvars.create(process.env.TRIGGER_PROJECT_REF, process.env.TRIGGER_ENV, {
    name: "PGPORT",
    value: process.env.PGPORT
});
await envvars.create(process.env.TRIGGER_PROJECT_REF, process.env.TRIGGER_ENV, {
    name: "PGDATABASE",
    value: process.env.PGDATABASE
});
