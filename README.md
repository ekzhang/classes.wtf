# [classes.wtf](https://classes.wtf/)

_I just want to take a class about **\[X\]** but searching the online catalog is so slow, and my results are largely irrelevant. WTF?_

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

**Can you make this for my school?** The code is all open-source, and you're welcome to take a look or port it! If you're doing this please also consider reaching out on Twitter [@ekzhang1](https://twitter.com/ekzhang1) or by [email](mailto:ekzhang1@gmail.com), since I'd love to hear about your work.

**Where is the data sourced?** The course catalog was indexed from publicly available course titles and descriptions online. See the code in the `datasource/` folder.

## Development

You need [Go 1.20](https://go.dev/) and [Docker](https://www.docker.com/) to work on the backend and [Node.js v18](https://nodejs.org/en/) for the frontend.

### Downloading the dataset

This loads data from Curricle for academic terms before Spring 2022 (AY 2022) and from My.Harvard starting in Fall 2022 (AY 2023). You can customize the data loading script if you'd like to index a different set of courses.

```bash
go run . download -year 2019  # -> data/courses-2019.json
go run . download -year 2020  # -> data/courses-2020.json
# ... and so on
go run . download -year 2024  # -> data/courses-2024.json
```

Unfortunately, My.Harvard does not allow you to view courses from previous academic years, so years between 2023 and the current one will probably not return any data. For those, you can download the appropriate preloaded datasets from our [public S3 bucket](https://s3.amazonaws.com/classes.wtf).

### Combining data

Once you have the year-by-year course data, you can combine them to form a single `courses.json` file with all of the courses, which can be searched by the webapp.

```bash
go run . combine
```

This looks for all files named `data/courses-{year}.json` and merges them.

### Running the server

The server listens for web requests on port 7500. (It also spawns a Redis instance, using Docker, on port 7501.)

```bash
go run . server -local -data data/courses.json
```

You can also run it with other data files. For example, if you pass `data/courses-2021.json`, you'll only get search results for the academic year from Fall 2020 to Spring 2021.

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
aws s3 cp data/courses-$YEAR.json s3://classes.wtf
aws s3 cp data/courses.json s3://classes.wtf
```

```bash
fly deploy
```

## Acknowledgements

See the [contributors page](https://github.com/ekzhang/classes.wtf/graphs/contributors). Current maintainers can be reached by email at [classes-wtf@googlegroups.com](mailto:classes-wtf@googlegroups.com). Licensed under the [MIT license](LICENSE).

Thanks to numerous students who helped advertise the site in college communities.
