package datasource

import (
	"encoding/json"
	"log"
	"os"
	"sort"
	"strconv"

	"github.com/schollz/progressbar/v3"
)

func DownloadCoursesCurricle() {
	const maxPerPage = 64

	totalCount, _, err := GqlGetCourses(nil, 0, 1)
	if err != nil {
		log.Fatalf("failed to get courses: %v", err)
	}
	if totalCount == 0 {
		log.Fatalf("no courses found")
	}

	bar := progressbar.Default(totalCount)
	var indices []int
	for i := 0; i < int(totalCount); i += maxPerPage {
		indices = append(indices, i)
	}

	var courses []Course
	end := indices[len(indices)-1] + maxPerPage // this is >= totalCount
	for len(indices) > 0 {
		start := indices[len(indices)-1]
		indices = indices[0 : len(indices)-1]
		perPage := end - start
		if start%perPage != 0 {
			panic("invariant violated: start / perPage")
		}
		page := start/perPage + 1
		_, data, err := GqlGetCourses(nil, perPage, page)
		if err != nil {
			if perPage == 1 {
				// skipping this document: had an error :(
				log.Printf("  -> skipping document %v due to %v\n", start, err)
				bar.Add(1)
				end = start
			} else {
				indices = append(indices, start, start+perPage/2)
			}
		} else {
			courses = append(courses, data...)
			bar.Add(len(data))
			end = start
		}
	}

	sort.Slice(courses, func(i, j int) bool {
		id1, _ := strconv.Atoi(courses[i].Id)
		id2, _ := strconv.Atoi(courses[j].Id)
		return id1 < id2
	})

	log.Printf("read %v out of %v total courses\n", len(courses), totalCount)

	coursesText, _ := json.Marshal(courses)
	if err := os.WriteFile("data/courses.json", coursesText, 0644); err != nil {
		log.Fatalf("failed to write courses.json: %v", err)
	}
}

func DownloadCoursesMyHarvard() {
	// TODO
}
