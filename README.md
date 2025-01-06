# para-hackathon-p1
## Running Locally
* use `ngrok tcp 5432` to open a tcp tunnel to postgres port
* update env variables in nextjs env and trigger env
    * can use the `npm run trigger-setup` command to update env variables
* run `npm run trigger` to start trigger dev CLI
* start main app with `npm run dev`
    * use the paratodemo.com proxy as the Slack integration requires an HTTPS URL
    * localhost wouldn't suffice
