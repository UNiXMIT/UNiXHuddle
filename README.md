# [UNiXHuddle](https://github.com/UNiXMIT/UNiXHuddle)

- [Overview](#overview)
- [Features](#features)
- [Install Instructions](#install-instructions)
- [AMC Huddle](#amc-huddle)
- [Backup Huddle](#backup-huddle)
- [Check Huddle Logs](#check-huddle-logs)
- [API](#api)

## Overview
A Team Huddle site where teams can submit metrics ready for a Daily Huddle discussion.  
Built with HTML, Javascript, Node.js, Express and SQLite.  
Data is written, using SQLite, to a file called huddleData.db. It contains a table for Huddle metrics, called huddleData, and a table for Huddle users, called huddleUsers.  

## Features
- Users can select their user and a date then enter their metrics for that day.  
- Data is pulled from the SQLite when a user changes the user or date in the form.  
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
```
mkdir /home/support/huddle
git clone https://github.com/UNiXMIT/UNiXHuddle.git /home/support/huddle
cd /home/support/huddle
chmod +x huddle.sh
./huddle.sh
``` 

## AMC Huddle
You can access the Huddle Web UI with:  
```
http://serverIP:3000
```

## Customization
To set a custom the name for the Huddle, modify the ``<title>`` and ``<h1>`` tag values in the index.html file.  
To modify the port that Huddle uses on the host, modify line 8 of the huddle.sh file before running it.  

## Backup Huddle
The Huddle huddleData.db file is mapped onto the host in the following location:  
```
/home/support/huddle/huddleData.db
```

## Check Huddle Logs
```
podman logs huddle
```

## API
### Add Users
POST /users  
```
{
  "userNames": ["Han Solo", "Darth Vader"]
}
```
cURL Example:  
```
curl --request POST \
  --url https://example.com:3000/users \
  --header 'Content-Type: application/json' \
  --data '{
    "userNames": ["Han Solo", "Darth Vader"]
  }'
```

### Delete User
DELETE /users  
```
{
  "userNames": ["Han Solo", "Darth Vader"]
}
```
cURL Example:  
```
curl --request DELETE \
  --url https://example.com:3000/users \
  --header 'Content-Type: application/json' \
  --data '{
    "userNames": ["Han Solo", "Darth Vader"]
  }'
```