package datasource

import (
	"bytes"
	_ "embed"
	"encoding/json"
	"fmt"
	"net/http"
)

const gqlEndpoint = "https://curricle.berkman.harvard.edu/graphql"

//go:embed getCourses.gql
var gqlQuery string

type gqlRequest struct {
	OperationName string         `json:"operationName"`
	Query         string         `json:"query"`
	Variables     map[string]any `json:"variables"`
}

type gqlResponse struct {
	Data struct {
		CoursesConnection gqlCourseData `json:"coursesConnection"`
	} `json:"data"`
}

type gqlCourseData struct {
	TotalCount int64            `json:"totalCount"`
	Nodes      []map[string]any `json:"nodes"`
}

func gqlGetCourses(pageSize, page uint) (count int64, courses []Course, err error) {
	gqlReq := gqlRequest{
		OperationName: "getCourses",
		Query:         gqlQuery,
		Variables: map[string]any{
			"perPage": pageSize,
			"page":    page,
		},
	}

	resp, err := gqlRequestRetry(&gqlReq)
	if err != nil {
		err = fmt.Errorf("graphql: %v", err)
		return
	}

	gqlResp := gqlResponse{}
	if err = json.NewDecoder(resp.Body).Decode(&gqlResp); err != nil {
		err = fmt.Errorf("could not unmarshal response body: %v", err)
		return
	}

	count = gqlResp.Data.CoursesConnection.TotalCount
	nodes := gqlResp.Data.CoursesConnection.Nodes
	for _, node := range nodes {
		instructors := []Instructor{}
		for _, obj := range node["courseInstructors"].([]any) {
			obj := obj.(map[string]any)
			instructors = append(instructors, Instructor{
				Name:  obj["displayName"].(string),
				Email: castOrEmpty(obj["email"]),
			})
		}
		meetingPatterns := []MeetingPattern{}
		for _, obj := range node["courseMeetingPatterns"].([]any) {
			obj := obj.(map[string]any)
			meetingPatterns = append(meetingPatterns, MeetingPattern{
				StartTime:        castOrEmpty(obj["meetingTimeStartTod"]),
				EndTime:          castOrEmpty(obj["meetingTimeEndTod"]),
				StartDate:        obj["startDate"].(string),
				EndDate:          obj["endDate"].(string),
				MeetsOnMonday:    obj["meetsOnMonday"].(bool),
				MeetsOnTuesday:   obj["meetsOnTuesday"].(bool),
				MeetsOnWednesday: obj["meetsOnWednesday"].(bool),
				MeetsOnThursday:  obj["meetsOnThursday"].(bool),
				MeetsOnFriday:    obj["meetsOnFriday"].(bool),
				MeetsOnSaturday:  obj["meetsOnSaturday"].(bool),
				MeetsOnSunday:    obj["meetsOnSunday"].(bool),
			})
		}
		courses = append(courses, Course{
			Id:                 node["id"].(string),
			ExternalId:         uint32(node["externalCourseId"].(float64)),
			QGuideId:           uint32(castOrZero(node["qGuideCourseId"])),
			Title:              castOrEmpty(node["title"]),
			Subject:            node["subject"].(string),
			SubjectDescription: node["subjectDescription"].(string),
			CatalogNumber:      node["catalogNumber"].(string),
			Level:              harvardLevel(node["courseLevel"].(string)),
			AcademicGroup:      node["academicGroup"].(string),
			Semester:           node["semester"].(string),
			AcademicYear:       uint32(node["academicYear"].(float64)),
			ClassSection:       node["classSection"].(string),
			Component:          node["component"].(string),
			Description:        sanitizeHtml(node["courseDescriptionLong"].(string)),
			Instructors:        instructors,
			MeetingPatterns:    meetingPatterns,
		})
	}

	return
}

func gqlRequestRetry(gqlReq *gqlRequest) (resp *http.Response, err error) {
	reqBody, err := json.Marshal(&gqlReq)
	if err != nil {
		err = fmt.Errorf("could not marshal request body: %v", err)
		return
	}

	const retries = 3

	client := &http.Client{}
	for i := 0; i < retries; i++ {
		req, _ := http.NewRequest("POST", gqlEndpoint, bytes.NewBuffer(reqBody))
		req.Header.Set("Content-Type", "application/json")

		resp, err = client.Do(req)
		if err != nil {
			err = fmt.Errorf("failed http request: %v", err)
			continue
		}
		if resp.StatusCode != http.StatusOK {
			err = fmt.Errorf("http request had bad status code: %v", resp.Status)
			resp.Body.Close()
			continue
		}
		err = nil
		return
	}
	return
}

func castOrZero(val any) float64 {
	if val == nil {
		return 0
	} else {
		return val.(float64)
	}
}

func castOrEmpty(val any) string {
	if val == nil {
		return ""
	} else {
		return val.(string)
	}
}

func harvardLevel(level string) string {
	switch level {
	case "PRIMUGRD", "INTRO":
		return "Intro"
	case "UGRDGRAD":
		return "Undergrad"
	case "PRIMGRAD":
		return "Graduate"
	case "GRADCOURSE":
		return "Research"
	default:
		return "N/A"
	}
}
