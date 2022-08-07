package server

import (
	"context"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"strings"
	"syscall"
	"time"

	"github.com/antelman107/net-wait-go/wait"
	"github.com/go-redis/redis/v8"
)

// Run spawns the backend server. This listens on port 7500 for HTTP requests,
// and it also creates an in-memory Redis instance in the background at port
// 7501 for text search.
func Run(uri string, local bool) {

	log.Printf("Starting Redis server...")
	var proc *exec.Cmd
	if local {
		proc = exec.Command("docker", "run", "-i",
			"--rm", "-p", "7501:6379", "redis/redis-stack-server:latest")
	} else {
		proc = exec.Command("redis-server",
			"--loadmodule", "/opt/redis-stack/lib/redisearch.so",
			"--loadmodule", "/opt/redis-stack/lib/rejson.so",
			"--port", "7501", "--save", "")
	}
	proc.Stdout = os.Stdout
	proc.Stderr = os.Stderr

	if err := proc.Start(); err != nil {
		log.Fatalf("failed to start redis: %v", err)
	}
	defer proc.Process.Signal(syscall.SIGTERM)

	if !wait.New().Do([]string{"localhost:7501"}) {
		log.Fatalf("failed to connect to redis")
	}

	log.Printf("Reading course data...")
	data, err := readData(uri)
	if err != nil {
		log.Fatalf("could not fetch data: %v", err)
	}
	log.Printf("Found %v courses", len(data))

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	rdb := redis.NewClient(&redis.Options{Addr: "localhost:7501"})

	log.Printf("Indexing course data...")
	start := time.Now()
	rdb.Do(ctx,
		"FT.CREATE", "courses", "ON", "JSON", "PREFIX", "1", "course:", "SCHEMA",
		"$.title", "AS", "title", "TEXT",
		"$.courseDescription", "AS", "tagline", "TEXT",
		"$.courseDescriptionLong", "AS", "description", "TEXT",
		"$.subject", "AS", "subject", "TEXT",
		"$.catalogNumber", "AS", "number", "TEXT",
		"$.semester", "AS", "semester", "TEXT",
		"$.courseInstructors.*.displayName", "AS", "instructor", "TEXT",
		"$.componentFiltered", "AS", "component", "TAG",
		"$.courseLevel", "AS", "level", "TAG",
		"$.academicGroup", "AS", "group", "TAG",
	)

	pipe := rdb.Pipeline()
	vals := make(map[string]map[string]interface{})
	for i, course := range data {
		id := course["id"].(string)
		s, err := json.Marshal(course)
		if err != nil {
			log.Fatalf("failed to marshal course id %v: %v", id, err)
		}
		vals["course:"+id] = course
		pipe.Do(ctx, "JSON.SET", "course:"+id, "$", s)
		if i%4000 == 3999 || i == len(data)-1 {
			if _, err := pipe.Exec(ctx); err != nil {
				log.Fatalf("error while indexing data: %v", err)
			}
			pipe = rdb.Pipeline()
		}
	}
	log.Printf("Finished indexing data in %v", time.Since(start))

	start = time.Now()
	count, results, err := runSearch(ctx, rdb, "GENED love")
	if err != nil {
		log.Fatalf("search failed: %v", err)
	}

	log.Printf("Search results (%v): %v", time.Since(start), count)
	for _, id := range results {
		course := vals[id]
		log.Printf("  - %v %v: %v (%v)", course["subject"], course["catalogNumber"],
			course["title"], course["semester"])
	}
}

// Execute a full text query on the Redis server, using the query language.
//
// This function returns the total number of results in the query set, as well
// as a slice of the first 100 document IDs.
func runSearch(
	ctx context.Context,
	rdb *redis.Client,
	query string,
) (count int64, results []string, err error) {
	val, err := rdb.Do(ctx,
		"FT.SEARCH", "courses", query,
		"RETURN", "0", "LIMIT", "0", "100",
	).Slice()
	if err != nil {
		return
	}
	count = val[0].(int64)
	for _, id := range val[1:] {
		results = append(results, id.(string))
	}
	return
}

func readData(uri string) (data []map[string]interface{}, err error) {
	var buf []byte
	if strings.HasPrefix(uri, "http://") || strings.HasPrefix(uri, "https://") {
		resp, err := http.Get(uri)
		if err != nil {
			return nil, err
		}
		defer resp.Body.Close()
		buf, err = io.ReadAll(resp.Body)
		if err != nil {
			return nil, err
		}
	} else {
		buf, err = os.ReadFile(uri)
		if err != nil {
			return nil, err
		}
	}
	err = json.Unmarshal(buf, &data)
	return
}
