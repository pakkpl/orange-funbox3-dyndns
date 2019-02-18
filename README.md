# Dynamic DNS for Orange Funbox 3.0
Script that read remote IP address from Orange Funbox 3.0 modem and then post it to dynDNS provider(s).

# Installation
Run this commands
```
sudo docker volume create dyndns
sudo docker run -v dyndns:/usr/src/app/config -d --name dyndns --restart on-failure pakkpl/orange-funbox3-dyndns
docker volume inspect dyndns
```
Then in docker volume move sample-config.json to config.json and fill configuration.
After this start container
```
sudo docker start dyndns
```
Logs
```
sudo docker logs dyndns
```
