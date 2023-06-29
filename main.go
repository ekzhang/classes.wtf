package main

import (
	"encoding/json"
	"flag"
	"log"
	"os"

	"classes.wtf/datasource"
	"classes.wtf/server"
)

func main() {
	if len(os.Args) < 2 {
		log.Fatal("expected to be called with a subcommand")
	}

	serverCmd := flag.NewFlagSet("server", flag.ExitOnError)
	serverData := serverCmd.String("data", "", "path or url for the data file")
	serverStatic := serverCmd.String("static", "", "path to static website files")
	serverLocal := serverCmd.Bool("local", false, "set to use local mode")

	switch os.Args[1] {
	case "download":
		var courses []datasource.Course

		for year := 2018; year <= 2021; year++ {
			curricle := datasource.SearchCurricle{Year: year, PerPage: 128}
			courses = append(courses, datasource.PaginatedDownload(&curricle, 2)...)
		}

		mh := datasource.SearchMh{Year: 2022}
		courses = append(courses, datasource.PaginatedDownload(&mh, 32)...)

		coursesText, _ := json.Marshal(courses)

		if err := os.WriteFile("data/courses.json", coursesText, 0644); err != nil {
			log.Fatalf("failed to write courses.json: %v", err)
		}
	case "server":
		serverCmd.Parse(os.Args[2:])
		if *serverData == "" {
			log.Fatal("server requires a -data file")
		}
		server.Run(*serverData, *serverStatic, *serverLocal)
	default:
		log.Fatal("unexpected subcommand")
	}
}
