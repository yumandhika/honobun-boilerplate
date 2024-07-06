# Axel-Api
```
     _              _      _    ____ ___ 
    / \   __  _____| |    / \  |  _ \_ _|
   / _ \  \ \/ / _ \ |   / _ \ | |_) | | 
  / ___ \  >  <  __/ |  / ___ \|  __/| | 
 /_/   \_\/_/\_\___|_| /_/   \_\_|  |___|
                                         
```
Axel api is api service provide booking and process service management

## Installation
To install dependencies
```bash
bun install
```
To Run
```bash
bun start        //bun run index.ts
```
Start with Watch
```bash
bun dev          //bun run --watch index.ts
```
Schema
```bash
bun db:studio    //running drizzle-kit studio
bun db:generate  //generating migration from scheme
bun db:up        //running migration
bun db:drop      //drop migration
```

## TechStack
- [Bun](https://bun.sh/) | (1.1.17)
- [Hono](https://hono.dev/) | (4.4.11)
- [Drizzle](https://orm.drizzle.team/) | (0.31.2)
- [Zod](https://zod.dev/) | (3.23.8)