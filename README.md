# gov_can-GEDSMACHINE
This takes the open data JSON from GEDS on the Government of Canada Open Data portal and inverts it into a tree of the entire government's structure. Secondly, it uses the Miro API to create a team-by-team visualization of that structure.

```node install```

The GEDS data comes from the open data portal [here](https://api.geds-sage.gc.ca/GEDS20/dist/opendata/gedsOpenDataJson.zip).

That data is not well formed for our needs, though. So ```geds_transformery.py``` just uses regex to read each person in the Open Data file into a proper list.

From there, ```Geds_department_Builder.py``` converts that 750MB JSON file into a more concise 5.5MB JSON file that represents every team in the Government of Canada and its population as listed in the contact directory.

That's the end of the Python portion of this exercise. It produces the nicely formed data we need. The rest is in the Node app, ```index.js```. which mostly uses the Miro REST API. Documentation and a walk-through on building your app and getting the required tokens is [here](https://developers.miro.com/docs/rest-api-how-tos).

There are three core functions in ```index.js```:
* drawHorizontal(departmentName, horizontalOffset, verticalOffset)
* drawVertical(departmentName, horizontalOffset, verticalOffset)
* drawInvertedVertical(departmentName, horizontalOffset, verticalOffset)

drawVertical() is a left-aligned tree with teams flowing out to the right. 
drawInvertedVertical is a right-aligned tree with teams flowing out to the left.

Horizontal and vertical offsets establish the centre of the drawing so that two departments can be drawn on the same board without overlapping each other.
