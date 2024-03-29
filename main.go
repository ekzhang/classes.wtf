package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"

	"classes.wtf/datasource"
	"classes.wtf/server"
)

func main() {
	if len(os.Args) < 2 {
		log.Fatal("expected to be called with a subcommand")
	}

	switch os.Args[1] {
	case "download":
		downloadCmd := flag.NewFlagSet("download", flag.ExitOnError)
		year := downloadCmd.Int("year", 0, "academic year to download")
		downloadCmd.Parse(os.Args[2:])

		var courses []datasource.Course

		switch {
		case *year == 0:
			log.Fatal("download requires a -year")

		case *year < 1991:
			log.Fatal("curricle does not have data before AY 1991")

		case *year <= 2022:
			log.Printf("downloading from Curricle for year %d", *year)
			curricle := datasource.SearchCurricle{Year: *year, PerPage: 128}
			courses = append(courses, datasource.PaginatedDownload(&curricle, 2)...)

		default:
			log.Printf("downloading from My.Harvard for year %d", *year)
			log.Print("note: course data may be missing for years except the current one")
			mh := datasource.SearchMh{Year: *year}
			courses = append(courses, datasource.PaginatedDownload(&mh, 32)...)
		}

		coursesJson, _ := json.Marshal(courses)
		filename := fmt.Sprintf("data/courses-%d.json", *year)
		if err := os.WriteFile(filename, coursesJson, 0644); err != nil {
			log.Fatalf("failed to write courses.json: %v", err)
		}

	case "combine":
		combineCmd := flag.NewFlagSet("combine", flag.ExitOnError)
		combineCmd.Parse(os.Args[2:])

		log.Printf("searching for course data in the data/ folder")
		results, err := filepath.Glob("data/courses-*.json")
		if err != nil {
			log.Fatalf("failed glob for data files: %v", err)
		}
		var courses []datasource.Course
		for _, filename := range results {
			file, err := os.Open(filename)
			if err != nil {
				log.Fatalf("failed to open %s: %v", filename, err)
			}
			var yearCourses []datasource.Course
			if err = json.NewDecoder(file).Decode(&yearCourses); err != nil {
				log.Fatalf("failed to parse %s: %v", filename, err)
			}
			log.Printf("  - %s  [len: %d]", filename, len(yearCourses))
			courses = append(courses, yearCourses...)
		}
		coursesJson, _ := json.Marshal(courses)
		if err := os.WriteFile("data/courses.json", coursesJson, 0644); err != nil {
			log.Fatalf("failed to write courses.json: %v", err)
		}
		log.Printf("wrote %d courses to data/courses.json", len(courses))

	case "split":
		splitCmd := flag.NewFlagSet("split", flag.ExitOnError)
		splitCmd.Parse(os.Args[2:])

		filename := "data/courses.json"

		log.Printf("parsing combined course data from %s", filename)
		file, err := os.Open(filename)
		if err != nil {
			log.Fatalf("failed to open %s: %v", filename, err)
		}
		var courses []datasource.Course
		if err = json.NewDecoder(file).Decode(&courses); err != nil {
			log.Fatalf("failed to parse %s: %v", filename, err)
		}

		log.Printf("got %d courses; splitting by year", len(courses))
		coursesByYear := make(map[uint32][]datasource.Course)
		for _, course := range courses {
			coursesByYear[course.AcademicYear] = append(coursesByYear[course.AcademicYear], course)
		}
		years := make([]uint32, 0, len(coursesByYear))
		for year := range coursesByYear {
			years = append(years, year)
		}
		sort.Slice(years, func(i, j int) bool { return years[i] < years[j] })

		log.Printf("writing")
		for _, year := range years {
			filename := fmt.Sprintf("data/courses-%d.json", year)
			yearCourses := coursesByYear[year]
			log.Printf("  - %s  [len: %d]", filename, len(yearCourses))
			yearCoursesJson, _ := json.Marshal(yearCourses)
			if err := os.WriteFile(filename, yearCoursesJson, 0644); err != nil {
				log.Fatalf("failed to write %s: %v", filename, err)
			}
		}

		log.Printf("wrote %d courses", len(courses))

	case "server":
		serverCmd := flag.NewFlagSet("server", flag.ExitOnError)
		data := serverCmd.String("data", "", "path or url for the data file")
		static := serverCmd.String("static", "", "path to static website files")
		local := serverCmd.Bool("local", false, "set to use local mode")
		serverCmd.Parse(os.Args[2:])

		if *data == "" {
			log.Fatal("server requires a -data file")
		}
		server.Run(*data, *static, *local)

	default:
		log.Fatal("unexpected subcommand")
	}
}
