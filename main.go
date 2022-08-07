package main

import (
	"fmt"
	"os"

	"classes.wtf/datasource"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Println("expected to be called with a subcommand")
		os.Exit(1)
	}

	switch os.Args[1] {
	case "download":
		if err := datasource.DownloadCourses(); err != nil {
			panic(err)
		}
	default:
		fmt.Println("unexpected subcommand")
		os.Exit(1)
	}
}
