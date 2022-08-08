# [classes.wtf](https://classes.wtf/)

_I just want to take a class about **\[X\]** but searching the online catalog is way too slow, and my results are largely irrelevant. WTF?_

![](https://i.imgur.com/UMBZDKU.png)

Harvard has many course search websites, but none of them are good. This project is an attempt to take the problem more seriously: write high-performance software and set great defaults so that people can get better, more useful suggestions, 100x faster.

## How does it work?

**Classes.wtf** is a custom, distributed search engine written in [Go](https://go.dev/) that focuses on speed and quality of results. It's built on an in-memory [Redis](https://redis.io/) database that runs as a subprocess of the application. This index supports full-text fuzzy and prefix search on all fields, along with a rich query syntax.

The frontend is a static website built with [Svelte](https://svelte.dev/), and it processes search queries immediately after every keystroke. The goal is for the entire {request, computation, response, and render} pipeline to take under 30 milliseconds.

"Now hang on just a second," I hear you saying. The speed of light is not fast enough for data to travel around the world at this latency! But don't worry, this is fine. We run multiple replicas at geographically distributed locations using [Fly.io](https://fly.io/) and route requests to the nearest one. Each replica runs its own full-text query engine, so they are completely independent.

(The nearest server replica to Cambridge, MA lives in Secaucus, NJ, only 200 miles away.)

### FAQ

**Why did you make this?** I was frustrated by how annoying it was to search for classes. And I'm a systems software engineer, which pretty much makes it my mandate to [make things faster](https://xkcd.com/1319/).

**Why is it written in Go?** Because I wrote this in a weekend and needed a really fast systems language to iterate on while also having low latency. Go's simplicity and compile times helped with this. I might rewrite it in Rust if I decide to spend a couple more weeks on it.

**Why are you using Redis?** It's really fast, it stores data in memory, the API is simple and robust, and it has a best-in-class full-text search module. For this size of dataset, embedding Redis gives you unmatched performance with a fraction of the cost and effort of alternatives.

**Can you make this for my school?** The code is all open-source, and you're welcome to take a look or port it! If you're doing this please also consider reaching out on Twitter [@ekzhang1](https://twitter.com/ekzhang1) or by [email](mailto:ekzhang1@gmail.com), since I'd love to talk tech and expand this into a shared course database together.

**Where is the data sourced?** The course catalog was indexed from publicly available course titles and descriptions online. See the code in the `datasource/` folder.

## Development

You need [Go 1.19](https://go.dev/) and [Docker](https://www.docker.com/) to work on the backend and [Node.js v16](https://nodejs.org/en/) for the frontend.

### Downloading the dataset

This takes around 3 minutes. You can customize the data loading script if you'd like to index a different set of courses.

```bash
go run . datasource
```

### Running the server

The server spawns a Redis instance using Docker on port 7501. It listens itself for web requests at `localhost:7500`.

```bash
go run . server -local -data data/courses.json
```

Now you can develop on the frontend, which automatically proxies API requests to the server port.

```
npm install
npm run dev
```

Visit `localhost:5173` to see the website.

### Building a container

```bash
docker build -t classes.wtf .
docker run -it --rm -p 7500:7500 classes.wtf
```

### Deployment

```bash
fly deploy [--remote-only] # for remote build
```

## Acknowledgements

Created by Eric Zhang ([@ekzhang1](https://twitter.com/ekzhang1)). Licensed under the [MIT license](LICENSE).
