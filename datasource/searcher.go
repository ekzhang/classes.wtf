package datasource

import (
	"log"
	"sort"
	"sync"

	"github.com/schollz/progressbar/v3"
	"golang.org/x/exp/slices"
)

// Searcher describes a type that can return paginated course data.
type Searcher interface {
	// PageSize is the number of courses returned per page.
	PageSize() int

	// TotalCount makes the request and returns the number of results.
	TotalCount() (int64, error)

	// Fetch returns a list of courses for the given page.
	Fetch(page uint) ([]Course, error)
}

// PaginatedDownload fetches courses over the network, with specified concurrency.
func PaginatedDownload(searcher Searcher, pageSize uint, concurrency uint) []Course {
	totalCount, err := searcher.TotalCount()
	if err != nil {
		log.Fatalf("failed to get courses: %v", err)
	}
	if totalCount == 0 {
		log.Fatalf("no courses found")
	}

	var mu sync.Mutex // Protects the courses list.
	var courses []Course
	bar := progressbar.Default(totalCount)

	var wg sync.WaitGroup
	semaphore := make(chan struct{}, concurrency)
	for i := uint(0); i < uint(totalCount); i += pageSize {
		i := i
		semaphore <- struct{}{}
		wg.Add(1)
		go func() {
			defer func() { <-semaphore }()
			defer wg.Done()
			data, err := searcher.Fetch(1 + i/pageSize)
			if err != nil {
				log.Fatalf("failed to get courses: %v", err)
			}
			mu.Lock()
			defer mu.Unlock()
			courses = append(courses, data...)
			bar.Add(len(data))
		}()
	}
	wg.Wait()

	initialLen := len(courses)
	sort.Slice(courses, func(i, j int) bool {
		return courses[i].Id < courses[j].Id
	})
	courses = slices.CompactFunc(courses, func(a, b Course) bool {
		return a.Id == b.Id
	})

	log.Printf("read %v out of %v total courses (%v before compaction)",
		len(courses), totalCount, initialLen)
	return courses
}
