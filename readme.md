# ViralWorks - API Framework Information
This is my API Framework which apply ExpressJS

## Technologies:
- NodeJS
- TypeScript
- Swagger UI
- OpenAPI Validation

## Dependencies:
- Node version: `v10.15.3`
- NPM version: `v6.4.1`
- `node-gyp`
- `python 2.x`
- Windows users will need the options for c# and c++ installed with their visual studio instance.

## Usage:
### Configuration
- `server.host` in `config.ts` file (**not recommended**)
- `server.port` in `config.ts` file (running port)
- `server.public` in `config.ts` file (public IP or Domain)
- `env` in `config.ts` file (Environment variable)
- `pepper` in  `config.ts` file (static string to hash password)

### ENV Example
```
# Common
ENV=dev

# Server
SERVER_HOST=127.0.0.1
SERVER_PORT=8080
SERVER_PUBLIC=127.0.0.1
SERVER_SCHEMA=http

# JWT
JWT_KEY="ViralWorks@2018#"
JWT_EXPIRE=2h

# Document
ENABLE_DOCUMENT=true

# Security
ENABLE_RBAC=true

# MongoDB V4
MONGO_HOST=206.189.82.47
MONGO_PORT=27017
MONGO_USERNAME=main_vw_v3
MONGO_PASSWORD="main_vw_v3@123"
MONGO_DB=main_vw_v3
MONGO_DEBUG=true
```

### Running
#### Install
```
$ cd <path_of_project>
$ npm install --global node-gyp
$ npm install
```

#### API Service
Please follow my bellow progress:
```
$ cd <path_of_project>
$ npm start
```

#### CLI
Show command helper
```
$ cd <path_of_project>
$ ./command
```

#### Watching
To watch changed file and re-run server
```
$ cd <path_of_project>
$ npm run watch
```

### Server address
Server will be run on: `<schema>://<host_or_address>:<port>/<version>/`
> By default: [`http://127.0.0.1:8080/v1.0/`](http://127.0.0.1:8080/v1.0/)

### Document site
Document will be run on: `<schema>://<host_or_address>:<port>/<version>/docs/`
> By default: [`http://127.0.0.1:8080/v1.0/docs/`](http://127.0.0.1:8080/v1.0/docs/)

## Contact:
Powered by [Daniel Huynh](https://www.linkedin.com/in/huynh-nhat-truong/) - [sir.truonghuynh@gmail.com](mailto:sir.truonghuynh@gmail.com)