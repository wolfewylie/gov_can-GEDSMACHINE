from seleniumwire import webdriver  # Import from seleniumwire
from seleniumwire.utils import decode
import time
import json

#This code largely drawn from here: https://pypi.org/project/selenium-wire/#all-options

# Create a new instance of the Chrome driver
driver = webdriver.Chrome()

downloadURLs = {}

# Go to the page
driver.get('https://onedrive.live.com/?cid=994cdaa3eee88fea&id=994CDAA3EEE88FEA%21106&authkey=!ACpKRkvFbmjf-PA')

#This is awkward, but you have to manually scroll down the page to load all items. 
#To Do -- automate this bit of scrolling after load.
time.sleep(10)

# Access requests via the `requests` attribute
for request in driver.requests:
    if "children" in request.url:
        response_body = json.loads(decode(request.response.body, request.response.headers.get('Content-Encoding', 'identity')))
        for every_file in response_body['value']:
            deptName = every_file['name'].replace('.json', '')
            deptDownloadURL = every_file['@content.downloadUrl']
            downloadURLs[deptName] = deptDownloadURL

with open('data_prep/json_files/OneDrivedataLinks.json', 'w') as outfile:
    json.dump(downloadURLs, outfile)
