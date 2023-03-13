import json
import time

#Start with the properly formatted data produced by geds_transformer.py
filename = "data_prep/json_files/updatedGEDS.json"
gedsData = {}
#There are a lot of orphan teams and branches in the data, so this will help to reduce random duplicates
lowestTree = {}
departmentTree = {"Canada": {'childOrgs': {}}}

with open(filename, 'r') as fileObject: 
    gedsData = json.loads(fileObject.read())

#Start looping through each employee
for each_staffer in gedsData:
    organization_layer = True
    department_layers = []
    current_layer = each_staffer['organizationInformation']
    #This build a hierarchical array of objects for each layer in climbing seniority
    while organization_layer == True:
        working_layer = current_layer['organization']
        current_org = {}
        current_org['id'] = working_layer['id']
        current_org['name_en'] = working_layer['description']['en']
        current_org['name_fr'] = working_layer['description']['fr']
        current_org['abbreviation_en'] = working_layer['acronym']['en']
        current_org['abbreviation_fr'] = working_layer['acronym']['fr']
        current_org['population'] = 1
        department_layers.append(current_org)
        if "organizationInformation" not in working_layer.keys():
            organization_layer = False
        else:
            current_layer = working_layer['organizationInformation']
    #Now we have an array of this person's layers. But some teams or individuals are orphaned in the data. So...
    #We have to check to see if we have a deeper listing for this team than this discovery of it. 
    #We'll store the deepest version of a team as the true version. Then each person can be properly mapped to their team.
    if department_layers[0]['id'] not in lowestTree:
        lowestTree[department_layers[0]['id']] = {"id": department_layers[0]['id'], "depth": len(department_layers), "layers": department_layers, 'name_en': department_layers[0]['name_en'], 'name_fr': department_layers[0]['name_fr'], 'abbreviation_en': department_layers[0]['abbreviation_en'], 'abbreviation_fr': department_layers[0]['abbreviation_fr']}
        stored_depth = len(department_layers)
        current_depth = len(department_layers)
    else:
        current_depth = len(department_layers)
        stored_depth = lowestTree[department_layers[0]['id']]['depth']
    if stored_depth < current_depth:
        lowestTree[department_layers[0]['id']]['layers'] = department_layers
        lowestTree[department_layers[0]['id']]['depth'] = len(department_layers)

with open('data_prep/json_files/DepartmentTree.json', 'w') as outfile:
    json.dump(lowestTree, outfile)

#Now that we have a proper tree structure with no duplicate team IDs, each team placed as deeply in the org structure as possible
#We can start going through staff to build out the population for each. 
for each_staff_member in gedsData:
    staff_team = each_staff_member['organizationInformation']['organization']['id']
    #Now we can place that staffer in our tree from before.
    team_layers = lowestTree[staff_team]['layers'].copy()
    #We can go through them from top to bottom in reverse order to build the gov tree. 
    team_layers.reverse()
    layer_depth = len(team_layers)
    layer_count = 0
    current_org = departmentTree["Canada"]['childOrgs']
    while layer_count < layer_depth:
        try:
            current_org[team_layers[layer_count]['name_en']]['population'] = current_org[team_layers[layer_count]['name_en']]['population'] + 1
        except:
            current_org[team_layers[layer_count]['name_en']] = {}
            current_org[team_layers[layer_count]['name_en']]['name_en'] = team_layers[layer_count]['name_en']
            current_org[team_layers[layer_count]['name_en']]['name_fr'] = team_layers[layer_count]['name_fr']
            current_org[team_layers[layer_count]['name_en']]['id'] = team_layers[layer_count]['id']
            current_org[team_layers[layer_count]['name_en']]['abbreviation_en'] = team_layers[layer_count]['abbreviation_en']
            current_org[team_layers[layer_count]['name_en']]['abbreviation_fr'] = team_layers[layer_count]['abbreviation_fr']
            current_org[team_layers[layer_count]['name_en']]['population'] = team_layers[layer_count]['population']
            current_org[team_layers[layer_count]['name_en']]['childOrgs'] = {}
        current_org = current_org[team_layers[layer_count]['name_en']]['childOrgs']
        layer_count = layer_count + 1

with open('data_prep/json_files/govTree.json', 'w') as outfile:
    json.dump(departmentTree, outfile)

#this little bit is just to make it easier to create the <select> <option> list in the miro app later.
departmentList = []

for each_department in departmentTree['Canada']['childOrgs']:
    departmentList.append((departmentTree['Canada']['childOrgs'][each_department]['name_en'], departmentTree['Canada']['childOrgs'][each_department]['name_fr']))
    with open('data_prep/json_files/department_files/' + each_department + '.json', 'w') as outfile:
        json.dump(departmentTree['Canada']['childOrgs'][each_department], outfile)

#sort it according to English names
departmentList.sort(key=lambda a: a[0])

for each_option in departmentList:
    print('<option selected value="' + each_option[0] + '">' + each_option[0] + '</option>')

print(' ')
print('-----------------------------')
print(' ')

#sort it according to French names
departmentList.sort(key=lambda a: a[1])
for each_option in departmentList:
    print('<option selected value="' + each_option[0] + '">' + each_option[1] + '</option>')