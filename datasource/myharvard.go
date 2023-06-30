// Public data source for My.Harvard, the official public course catalog.

package datasource

import (
	"bytes"
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
)

// The official Harvard course catalog's search endpoint.
const mhEndpoint = "https://courses.my.harvard.edu/psc/courses/EMPLOYEE/EMPL/s/WEBLIB_IS_SCL.ISCRIPT1.FieldFormula.IScript_Search"

// Non-configurable page size for results.
const mhPageSize = 25

// SearchMh implements Searcher for the My.Harvard search endpoint.
type SearchMh struct {
	Year int
}

func (s *SearchMh) PageSize() uint {
	return mhPageSize
}

func (s *SearchMh) TotalCount() (int64, error) {
	props, _, err := s.request(1)
	if err != nil {
		return 0, err
	}
	return int64(props["HitCount"].(float64)), nil
}

func (s *SearchMh) Fetch(page uint) (courses []Course, err error) {
	_, results, err := s.request(1)
	if err != nil {
		return
	}

	if results["Key"].(string) != "Results" {
		err = fmt.Errorf("expected key 'Results', got %v", results["Key"])
		return
	}
	for _, obj := range results["ResultsCollection"].([]any) {
		obj := obj.(map[string]any)
		hsh := md5.New()
		hsh.Write([]byte(obj["Key"].(string)))
		id := hex.EncodeToString(hsh.Sum(nil)) // Use md5(Key) as a unique ID.

		// TODO: Can you get emails from the API response?
		instructors := []Instructor{}
		switch v := obj["IS_SCL_DESCR_IS_SCL_DESCRL"].(type) {
		case string:
			instructors = append(instructors, Instructor{Name: v})
		case []any:
			for _, name := range v {
				instructors = append(instructors, Instructor{Name: name.(string)})
			}
		}

		meetingPatterns := []MeetingPattern{}
		if sections, ok := obj["MultiSection"]; !ok {
			if pat := mhMakeMeetingPattern(
				obj["MON"], obj["TUES"], obj["WED"], obj["THURS"], obj["FRI"], obj["SAT"], "",
				obj["IS_SCL_TIME_START"], obj["IS_SCL_TIME_END"], obj["START_DT"], obj["END_DT"],
			); pat != nil {
				meetingPatterns = append(meetingPatterns, *pat)
			}
		} else {
			for _, sec := range sections.([]any) {
				// "MutiSection" classes have their own strange, inconsistent format.
				sec := sec.(map[string]any)
				if pat := mhMakeMeetingPattern(
					sec["Mo"], sec["Tu"], sec["We"], sec["Th"], sec["Fr"], sec["Sa"], sec["Su"],
					sec["IS_SCL_TIME_START"], sec["IS_SCL_TIME_END"], sec["START_DT"], sec["END_DT"],
				); pat != nil {
					meetingPatterns = append(meetingPatterns, *pat)
				}
			}
		}

		level, ok := obj["CRSE_ATTR_VALUE_HU_LEVL_ATTR"]
		if !ok {
			level = ""
		}
		courses = append(courses, Course{
			Id:                 id,
			ExternalId:         castAsInt(obj["CRSE_ID"].(string)),
			QGuideId:           0,                                 // New courses don't use the old Q guide.
			Title:              removeTags(obj["Title"].(string)), // Sometimes there are <b> tags.
			Subject:            obj["SUBJECT"].(string),
			SubjectDescription: obj["IS_SCL_DESCR_IS_SCL_DESCRD"].(string),
			CatalogNumber:      strings.Trim(obj["CATALOG_NBR"].(string), " "),
			Level:              harvardLevel(level.(string)),
			AcademicGroup:      obj["ACAD_CAREER"].(string),
			Semester:           mhReverseSemesterOrder(obj["IS_SCL_DESCR_IS_SCL_DESCRH"].(string)),
			AcademicYear:       castAsInt(obj["ACAD_YEAR"].(string)),
			ClassSection:       obj["CLASS_SECTION"].(string),
			Component:          obj["SSR_COMPONENTDESCR"].(string),
			Description:        sanitizeHtml(obj["IS_SCL_DESCR"].(string)),
			Instructors:        instructors,
			MeetingPatterns:    meetingPatterns,
		})
	}

	return
}

func (s *SearchMh) request(page uint) (props map[string]any, results map[string]any, err error) {
	var yearFilter string

	if s.Year == 2023 {
		yearFilter = `(STRM:"2228" | STRM:"2232")`
	} else {
		err = fmt.Errorf("no filter set for year %v", s.Year)
		return
	}

	facets := []string{
		"IS_SCL_DESCR_IS_SCL_DESCRI:Faculty of Arts & Sciences:School", // Restrict courses to FAS.
	}

	search := map[string]any{
		"ExcludeBracketed":          true,
		"Exclude300":                true, // Exclude graduate-level courses.
		"Facets":                    facets,
		"PageNumber":                page,
		"Category":                  "HU_SCL_SCHEDULED_BRACKETED_COURSES",
		"SearchPropertiesInResults": true,
		"FacetsInResults":           false,
		"SearchText":                yearFilter,
	}
	data, err := mhSearchRaw(search)
	if err != nil {
		return
	}
	if len(data) != 3 {
		err = fmt.Errorf("expected 3 elements in my.harvard response, got %v", len(data))
		return
	}
	results = data[0].(map[string]any)
	props = data[2].(map[string]any)
	if props["Key"].(string) != "SearchProperties" {
		err = fmt.Errorf("expected key 'SearchProperties', got %v", props["Key"])
		return
	}
	realPageSize := uint(props["PageSize"].(float64))
	if realPageSize != mhPageSize {
		err = fmt.Errorf("passed page size of %v, but received page size of %v",
			mhPageSize, realPageSize)
		return
	}
	return
}

// Make a raw POST request to the My.Harvard search endpoint.
func mhSearchRaw(search map[string]any) ([]any, error) {
	params := url.Values{}
	reqText, err := json.Marshal(search)
	if err != nil {
		return nil, fmt.Errorf("could not marshal search request: %v", err)
	}
	params.Add("SearchReqJSON", string(reqText))
	reqBody := params.Encode()

	req, _ := http.NewRequest("POST", mhEndpoint, bytes.NewBuffer([]byte(reqBody)))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed graphql request: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("post request had bad status code: %v", resp.Status)
	}

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %v", err)
	}
	var jsonResp []any
	if err := json.Unmarshal(respBody, &jsonResp); err != nil {
		return nil, fmt.Errorf("could not unmarshal response body: %v\n"+
			"response body: %v", err, respBody)
	}
	return jsonResp, nil
}

// Reverses a string like "2022 Spring" to "Spring 2022".
func mhReverseSemesterOrder(s string) string {
	segments := strings.SplitN(s, " ", 2)
	return segments[1] + " " + segments[0]
}

// Converts a time like "7:30pm" to "19:30".
func mhTo24hr(s string) string {
	if s == "" {
		return ""
	}
	n := len(s)
	offset := 0
	switch s[n-2:] {
	case "am":
	case "pm":
		offset = 12
	default:
		panic("unknown time format for " + s)
	}
	parts := strings.SplitN(s[:n-2], ":", 2)
	hours, err := strconv.Atoi(parts[0])
	if err != nil {
		panic(err)
	}
	minutes, err := strconv.Atoi(parts[1])
	if err != nil {
		panic(err)
	}
	if hours == 12 { // 12:00pm -> 12:00, and 12:00am -> 00:00.
		hours = 0
	}
	hours += offset
	return fmt.Sprintf("%02d:%02d", hours, minutes)
}

func mhMakeMeetingPattern(mon, tues, wed, thurs, fri, sat, sun,
	startTime, endTime, startDate, endDate any) *MeetingPattern {
	if mon.(string) == "Y" || tues.(string) == "Y" || wed.(string) == "Y" ||
		thurs.(string) == "Y" || fri.(string) == "Y" || sat.(string) == "Y" || sun.(string) == "Y" {
		return &MeetingPattern{
			StartTime:        mhTo24hr(startTime.(string)),
			EndTime:          mhTo24hr(endTime.(string)),
			StartDate:        startDate.(string)[:10], // YYYY-MM-DD
			EndDate:          endDate.(string)[:10],
			MeetsOnMonday:    mon.(string) == "Y",
			MeetsOnTuesday:   tues.(string) == "Y",
			MeetsOnWednesday: wed.(string) == "Y",
			MeetsOnThursday:  thurs.(string) == "Y",
			MeetsOnFriday:    fri.(string) == "Y",
			MeetsOnSaturday:  sat.(string) == "Y",
			MeetsOnSunday:    sun.(string) == "Y",
		}
	} else {
		return nil
	}
}
