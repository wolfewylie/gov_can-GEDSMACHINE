import json
import re 

filename = "gedsOpenData.json"
gedsData = ""

with open(filename, 'r') as fileObject: 
    gedsData = fileObject.read()

newGEDSFile = []

# Just REGEX our way through the text file to identify the individual people and save them as a list
for every_person in re.finditer("\{(.+?)\}\n", gedsData, re.DOTALL):
    new_person = every_person.group(0)
    newJson = json.loads(new_person)
    newGEDSFile.append(newJson)

print(len(newGEDSFile), " records found.")

#Save that new list to a proper file
with open('updatedGEDS.json', 'w') as outfile:
    json.dump(newGEDSFile, outfile)