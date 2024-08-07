# [UNiXHuddle](https://github.com/UNiXMIT/UNiXHuddle)

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Cloud Environment](#cloud-environment)
- [Install Instructions](#install-instructions)
- [Huddle Web UI](#huddle-web-ui)
- [Customization](#customization)
- [Backup Huddle](#backup-huddle)
- [Check Huddle Logs](#check-huddle-logs)
- [Huddle API](#huddle-api)

## Overview
A Team Huddle site where teams can submit metrics ready for a Daily Huddle discussion.  
Built with HTML, Javascript, Node.js, Express.   
Data is written to a PostgreSQL database.  

## Features
- Users can select their user and a date then enter their metrics for that day.  
- Data is pulled from the PostgreSQL when a user changes the user or date in the form.  
- The Huddle host can navigate through the user list using the arrows in the form or with the keyboard left and right arrow keys.   
- If a users capacity is greater than 3 or their wellbeing is 30 minutes or less, those metrics will appear as red and bold so the Huddle host can easily spot them.  
- There are multiple API endpoints for adding/removing users, and collecting metrics.  

## Prerequisites
Install Podman (or Docker).  
```
dnf install podman -y
```

## Cloud Environment
### Minimum AWS EC2 Instance requirements
t3.micro  
20GB SSD  

### Minimum Azure EC2 Instance requirements
Standard_B2ls_v2  
20GB SSD  

## Install Instructions
You need to modify the huddle.sh file to change the host directory. Also change the values for the DB_* environment variables.  
```
mkdir /home/support/huddle
git clone https://github.com/UNiXMIT/UNiXHuddle.git /home/support/huddle
cd /home/support/huddle
chmod +x huddle.sh
./huddle.sh
``` 

## Huddle Web UI
You can access the Huddle Web UI with:  
```
http://serverIP:3000
```

## Customization
To set a custom the name for the Huddle, modify the ``<title>`` and ``<h1>`` tag values in the index.html file.  
To modify the port that Huddle uses on the host, modify line 8 of the huddle.sh file before running it, where 'xxxx' is an available port on the host machine to use.    
```
-p xxxx:3000
```

## Check Huddle Logs
```
podman logs huddle
```

## Huddle API
### Get Team(s)
GET /teams   
cURL Example:    
```
curl --request GET --url https://example.com:3000/teams
```
Response:  
```
[{ "userteam": "SW", "userteamname": "Star Wars" }]
```

### Add Team(s)
POST /teams  
```
[{ "userteam": "SW", "userteamname": "Star Wars" }]
```
cURL Example:  
```
curl --request POST \
  --url https://example.com:3000/teams \
  --header 'Content-Type: application/json' \
  --data '[{
    "userteam": "SW", "userteamname": "Star Wars"
  }]'
```

### Delete Team(s)
DELETE /teams  
```
[{ "userteam": "SW", "userteamname": "Star Wars" }]
```
cURL Example:  
```
curl --request DELETE \
  --url https://example.com:3000/teams \
  --header 'Content-Type: application/json' \
  --data '{
    "userteam": "SW", "userteamname": "Star Wars"
  }'
```

### Get User(s)
GET /users  
cURL Example:  
```
curl --request GET --url https://example.com:3000/users?userteam=SW
```
Response:
```
{
  "usernames": ["Han Solo", "Darth Vader"]
}
```

### Add User(s)
POST /users  
```
{
  "usernames": ["Han Solo", "Darth Vader"],
  "userteam": "SW"
}
```
cURL Example:  
```
curl --request POST \
  --url https://example.com:3000/users \
  --header 'Content-Type: application/json' \
  --data '{
    "usernames": ["Han Solo", "Darth Vader"],
    "userteam": "SW"
  }'
```

### Delete User(s)
DELETE /users  
```
{
  "usernames": ["Han Solo", "Darth Vader"],
  "userteam": "SW"
}
```
cURL Example:  
```
curl --request DELETE \
  --url https://example.com:3000/users \
  --header 'Content-Type: application/json' \
  --data '{
    "usernames": ["Han Solo", "Darth Vader"],
    "userteam": "SW"
  }'
```

### Get Metrics
GET /metrics
```
http://example.com:3000/metrics?userteam=SW&start=2024-01-28&end=2024-02-28
```
To get this data directly into Excel:  
1. Open Excel Desktop.  
2. Create a blank workbook.  
3. Select Data > Get & Transform > From Web.  
4. Enter the API URL (modifying the start and end dates) into the text box, and click OK.  
5. The Navigator pane should already have the Transform tab selected. Select 'To Table' and click OK, accepting the defaults.  
6. Left click the arrows in the 'Column1' header. This will reveal the names of the value pairs.  
7. Uncheck the box 'Use original column name as prefix' and click OK.  
  You should now see a preview of the table with the data from the API response.  
8. Select 'Close & Load' in the Navigator pane.  
  The data will now be loaded into a table in the Excel workbook.  