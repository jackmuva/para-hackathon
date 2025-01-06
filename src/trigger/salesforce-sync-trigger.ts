import { schedules, envvars } from "@trigger.dev/sdk/v3";
import { syncSalesforceTask } from "./salesforce-sync-task";

export const triggerSalesforceSync = schedules.task({
	id: "trigger-salesforce-sync",
	//every 3 minutes (in dev, this only runs when the dev cli is used) 
	cron: "*/3 * * * *",
	run: async (payload, { ctx }) => {
		const pgUser = await envvars.retrieve("proj_aiyirhllavhklpqransj", "dev", "PGUSER");
		const pgPassword = await envvars.retrieve("proj_aiyirhllavhklpqransj", "dev", "PGPASSWORD");
		const pgHost = await envvars.retrieve("proj_aiyirhllavhklpqransj", "dev", "PGHOST");
		const pgPort = await envvars.retrieve("proj_aiyirhllavhklpqransj", "dev", "PGPORT");
		const pgDatabase = await envvars.retrieve("proj_aiyirhllavhklpqransj", "dev", "PGDATABASE");

		const pool = initializePool(pgUser.value, pgPassword.value, pgHost.value, Number(pgPort.value), pgDatabase.value);

		const instances = await getSalesforceInstances(pool);
		console.log(instances);
		instances.forEach((instance: any) => {
			console.log(instance);
			syncSalesforceTask.batchTrigger([{ payload: { email: instance[0].split(",")[1], instance_url: instance[0].split(",")[4] } }]);
		});
	},
});


//@ts-ignore
import pg from 'pg';
const { Pool } = pg;

const initializePool = (pgUser: string, pgPassword: string, pgHost: string, pgPort: number, pgDatabase: string) => {
	const pool = new Pool({
		user: pgUser,
		password: pgPassword,
		host: pgHost,
		port: pgPort,
		database: pgDatabase
	});
	return pool;
}

export const getSalesforceInstances = async (pool: any) => {
	let result = [];
	try {
		const text = `SELECT DISTINCT(id, email, access_token, refresh_token, instance_url, sync)
	FROM public.salesforce_credentials WHERE sync = true;`

		const res = await pool.query({ text: text, rowMode: 'array' });
		result = res.rows;
	} catch (err) {
		console.log("[POSTGRES] " + err);
	}
	return result;
}


