# [classes.wtf](https://classes.wtf/)

_A course catalog with full-text search that's so fast, you can't even perceive any delay._

Harvard's has many course search websites, but they are slow and tend to return poor quality results. This project is an attempt to take the problem seriously: write high-performance software and set good defaults so that people can get better, more salient suggestions, 100x faster.

## WTF: How does it work?

**Classes.wtf** implements a globally distributed custom search engine written in [Go](https://go.dev/), built on an in-memory [Redis](https://redis.io/) database that runs as a subprocess of the application. This supports full-text fuzzy and prefix search on all fields, along with a rich query syntax.

The frontend is a static website built with [Svelte](https://svelte.dev/), and it sends search queries immediately after every keystroke. The goal is for the entire request, computation, response, and render pipeline to take under 20 milliseconds.

Observant readers will notice that the speed of light is not fast enough for data to travel around the world at this latency. This is okay though. We run multiple replicas at geographically distributed locations using [Fly.io](https://fly.io/) and route requests to the nearest one. Each replica runs its own full-text query engine, so they are completely independent.

(The nearest server replica to Cambridge, MA lives in Secaucus, NJ, only 200 miles away.)

### FAQ

**Why did you make this?** I was frustrated by how annoying it was to search for classes. And I'm a systems software engineer, which pretty much gives me domain expertise in [making things faster](https://xkcd.com/1319/).

**Why is it written in Go?** Because I wrote this in a weekend and needed a really fast systems language to iterate on while also having low latency. Go's simplicity and compile times helped with this. I'd probably rewrite it in Rust if I decided to spend a couple more weeks on it.

**Why are you using Redis?** It's really fast, it stores data in memory, the API is simple and robust, and it has a best-in-class full-text search module. For this size of dataset embedding Redis gives you unmatched performance, with a fraction of the cost and effort of alternatives.

**Can you make this for my school?** The code is all open-source, and you're welcome to take a look or port it! If you're doing this please also consider sending me a Twitter DM [@ekzhang1](https://twitter.com/ekzhang1) or an [email](mailto:ekzhang1@gmail.com), since I'd love to talk tech and make this bigger together.

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
