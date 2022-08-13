package server

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path"
	"strings"
	"time"

	"github.com/NYTimes/gziphandler"
	"github.com/antelman107/net-wait-go/wait"
	"github.com/go-redis/redis/v8"

	"classes.wtf/datasource"
)

// Provides access to a populated text search index.
type TextSearch struct {
	ctx  context.Context
	rdb  *redis.Client
	vals map[string]datasource.Course
}

func (ts *TextSearch) init(data []datasource.Course) error {
	ts.rdb.Do(ts.ctx,
		"FT.CREATE", "courses", "ON", "JSON", "PREFIX", "1", "course:", "NOOFFSETS",
		"SCHEMA",
		"$.title", "AS", "title", "TEXT", "WEIGHT", "2",
		"$.description", "AS", "description", "TEXT",
		"$.subject", "AS", "subject", "TEXT", "NOSTEM", "WEIGHT", "2",
		"$.catalogNumber", "AS", "number", "TEXT", "NOSTEM", "WEIGHT", "2",
		"$.semester", "AS", "semester", "TEXT",
		// HACK: Replace with a multi-field `$.instructors..name`
		// index after https://github.com/RediSearch/RediSearch/pull/2819 is
		// released (likely in RediSearch 2.5).
		"$.instructors[0].name", "AS", "instructor", "TEXT", "NOSTEM", "PHONETIC", "dm:en",
		"$.instructors[1].name", "AS", "instructor2", "TEXT", "NOSTEM", "PHONETIC", "dm:en",
		"$.instructors[2].name", "AS", "instructor3", "TEXT", "NOSTEM", "PHONETIC", "dm:en",
		"$.component", "AS", "component", "TAG",
		"$.level", "AS", "level", "TAG",
		"$.academicGroup", "AS", "group", "TAG",
	)

	pipe := ts.rdb.Pipeline()
	ts.vals = make(map[string]datasource.Course)
	for i, course := range data {
		id := course.Id
		s, err := json.Marshal(course)
		if err != nil {
			return fmt.Errorf("failed to marshal course id %v: %v", id, err)
		}
		if _, ok := ts.vals["course:"+id]; ok {
			return fmt.Errorf("duplicate course id %v", id)
		}
		ts.vals["course:"+id] = course
		pipe.Do(ts.ctx, "JSON.SET", "course:"+id, "$", s)
		if i%4000 == 3999 || i == len(data)-1 {
			if _, err := pipe.Exec(ts.ctx); err != nil {
				return fmt.Errorf("error while adding data: %v", err)
			}
			pipe = ts.rdb.Pipeline()
		}
	}
	return nil
}

// Execute a full text query on the Redis server, using the query language.
//
// This function returns the total number of results in the query set, as well
// as a slice of the first 100 document IDs.
func (ts *TextSearch) search(query string) (count int64, results []string, err error) {
	val, err := ts.rdb.Do(ts.ctx,
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

func (ts *TextSearch) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	start := time.Now()
	count, results, err := ts.search(query)
	elapsed := time.Since(start)
	log.Printf("Queried %q in %v", query, elapsed)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]any{
			"error": err.Error(),
		})
		return
	}
	var courses []datasource.Course
	for _, id := range results {
		courses = append(courses, ts.vals[id])
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"count":   count,
		"courses": courses,
		"time":    elapsed.Seconds(),
	})
}

// Run spawns the backend server. This listens on port 7500 for HTTP requests,
// and it also creates an in-memory Redis instance in the background at port
// 7501 for text search.
func Run(uri string, static string, local bool) {
	log.Printf("Starting Redis server...")
	var proc *exec.Cmd
	if local {
		exec.Command("docker", "kill", "classes.wtf-redis").Run()
		proc = exec.Command("docker", "run", "--name", "classes.wtf-redis",
			"-i", "--rm", "-p", "7501:6379", "redis/redis-stack-server:latest",
			"redis-stack-server", "--save", "")
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
	ts := &TextSearch{ctx, rdb, nil}

	log.Printf("Indexing course data...")
	start := time.Now()
	if err := ts.init(data); err != nil {
		log.Fatalf("faild to index data: %v", err)
	}
	log.Printf("Finished indexing data in %v", time.Since(start))

	log.Printf("Listening at http://localhost:7500")
	http.Handle("/search", gziphandler.GzipHandler(ts))
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" && static != "" {
			http.ServeFile(w, r, path.Join(static, "index.html"))
		} else {
			w.WriteHeader(http.StatusNotFound)
		}
	})
	if static != "" {
		staticFiles := gziphandler.GzipHandler(
			http.FileServer(http.Dir(path.Join(static, "assets"))))
		http.Handle("/assets/", http.StripPrefix("/assets", staticFiles))
	}
	log.Fatal(http.ListenAndServe(":7500", nil))
}

func readData(uri string) (data []datasource.Course, err error) {
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
