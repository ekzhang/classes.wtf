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
	"strings"

	"github.com/antelman107/net-wait-go/wait"
	"github.com/go-redis/redis/v8"
)

// Run spawns the backend server. This listens on port 7500 for HTTP requests,
// and it also creates an in-memory Redis instance in the background at port
// 7501 for text search.
func Run(uri string, local bool) {
	log.Printf("Reading course data...")
	data, err := readData(uri)
	if err != nil {
		log.Fatalf("could not fetch data: %v", err)
	}
	log.Printf("Found %v courses", len(data))

	log.Printf("Starting Redis server...")
	var proc *exec.Cmd
	if local {
		proc = exec.Command("docker", "run", "-i",
			"--rm", "-p", "7501:6379", "redis/redis-stack:latest")
	} else {
		proc = exec.Command("redis-stack-server",
			"--port", "7501", "--save", "", "--dbfilename", "")
	}

	if err := proc.Start(); err != nil {
		log.Fatalf("failed to start redis: %v", err)
	}
	if !wait.New().Do([]string{"localhost:7501"}) {
		log.Fatalf("failed to connect to redis")
	}

	ctx := context.Background()
	rdb := redis.NewClient(&redis.Options{Addr: "localhost:7501"})

	rdb.Set(ctx, "key", "value", 0)
	fmt.Printf("%v\n", rdb.Get(ctx, "key").Val())
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
