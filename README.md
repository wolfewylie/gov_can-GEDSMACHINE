# gov_can-GEDSMACHINE
This takes the open data JSON from GEDS on the Government of Canada Open Data portal and inverts it into a tree of the entire government's structure. Secondly, it integrates with Miro to create a team-by-team visualization of that structure.

The GEDS data comes from the open data portal [here](https://api.geds-sage.gc.ca/GEDS20/dist/opendata/gedsOpenDataJson.zip).

That data is not well formed for our needs, though. So the ```data_prep``` directory includes three scripts to make it real:

```geds_transformery.py``` just uses regex to read each person in the Open Data file into a proper list.

```Geds_department_Builder.py``` converts that 750MB JSON file into a more concise 5.5MB JSON file that represents every team in the Government of Canada and its population count.

That script also spits out a json file for each federal department. For this exercise, I'm storing those in a Microsoft OneDrive folder.

```oneDrive_reader.py``` reads that folder and gathers the stable file download links into another json file that we can feed into Miro.

That's the end of the Python portion of this exercise. The rest takes place in the ```miro-app``` directory.

To run locally, you'll need to [create a developer account in Miro](https://developers.miro.com/docs/task-3-run-your-first-app-in-miro) and then:

```npm install```

```npm run start```

ToDo stuff and next steps are plentiful.