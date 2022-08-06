package datasource

import (
	_ "embed"
	"encoding/json"
	"fmt"
	"os"

	"github.com/schollz/progressbar/v3"
)

func DownloadCourses() error {
	const perPage = 50
	const retries = 5

	data, err := GetCourses(nil, 0, 1)
	if err != nil {
		return fmt.Errorf("failed to get courses: %v", err)
	}

	totalCount := data.TotalCount
	pages := (totalCount + perPage - 1) / perPage

	var courses []map[string]interface{}
	bar := progressbar.Default(int64(pages))
	for page := 1; page <= pages; page++ {
		data = nil
		for i := 0; i < retries; i++ {
			data, err = GetCourses(nil, perPage, page)
			if err != nil {
				fmt.Printf("retrying page %v, attempt %v/%v\n", page, i+1, retries)
				continue
			}
			break
		}
		if data == nil {
			fmt.Printf("failed to get courses for page %v: %v\n", page, err)
		} else {
			courses = append(courses, data.Courses...)
		}
		bar.Add(1)
	}

	fmt.Printf("read %v out of %v total courses\n", len(courses), totalCount)

	coursesText, _ := json.Marshal(courses)
	if err := os.WriteFile("data/courses.json", coursesText, 0644); err != nil {
		return fmt.Errorf("failed to write courses.json: %v", err)
	}

	return nil
}
