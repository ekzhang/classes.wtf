package main

import (
	"classes.wtf/datasource"
)

func main() {
	if err := datasource.DownloadCourses(); err != nil {
		panic(err)
	}
}
