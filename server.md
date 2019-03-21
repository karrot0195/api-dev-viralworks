# Server configuration
## Requirement
- CentOS `7.5`
- NodeJS `v10.15.3`
- PM2
- NginX
- Certbot-nginx (Let's encrypt)
## Guide line
#### 1. Clone resource from git
#### 2. Install node modules
#### 3. Use PM2 to run Web service
```
$ cd <project_path> && pm2 start npm -- start
```
#### 4. Config NginX reverse proxy call to web service
> By default: http://127.0.0.1:8080
#### 5. Register SSL certification with Certbot-nginx
> Docs: https://linuxhostsupport.com/blog/how-to-install-lets-encrypt-on-centos-7-with-apache/
#### 6. Re-config .env file to web service work with SSL. Example:
```
# Server
...
SERVER_PUBLIC_HOST=api.dev.viralworks.com
SERVER_PUBLIC_PORT=443
```
#### 7. Restart PM2
```
$ pm2 restart <project_id>
```
#### 8. Set crontab to renew SSL Certification. Let's Encrypt recommends twice a day
```
* */12 * * * /usr/bin/certbot renew >/dev/null 2>&1
```
