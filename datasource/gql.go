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

type GqlRequest struct {
	OperationName string         `json:"operationName"`
	Query         string         `json:"query"`
	Variables     map[string]any `json:"variables"`
}

type GqlResponse struct {
	Data struct {
		CoursesConnection GqlCourseData `json:"coursesConnection"`
	} `json:"data"`
}

type GqlCourseData struct {
	TotalCount int64            `json:"totalCount"`
	Nodes      []map[string]any `json:"nodes"`
}

func GqlGetCourses(keywords *string, perPage, page int) (count int64, courses []Course, err error) {
	gqlReq := GqlRequest{
		OperationName: "getCourses",
		Query:         gqlQuery,
		Variables: map[string]any{
			"query":   keywords,
			"perPage": perPage,
			"page":    page,
		},
	}
	reqBody, err := json.Marshal(&gqlReq)
	if err != nil {
		err = fmt.Errorf("could not marshal request body: %v", err)
		return
	}

	req, _ := http.NewRequest("POST", gqlEndpoint, bytes.NewBuffer(reqBody))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		err = fmt.Errorf("failed graphql request: %v", err)
		return
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		err = fmt.Errorf("graphql request had bad status code: %v", resp.Status)
		return
	}

	gqlResp := GqlResponse{}
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
			Level:              gqlLevel(node["courseLevel"].(string)),
			AcademicGroup:      node["academicGroup"].(string),
			Semester:           node["semester"].(string),
			AcademicYear:       uint32(node["academicYear"].(float64)),
			ClassSection:       node["classSection"].(string),
			Component:          node["component"].(string),
			Description:        node["courseDescriptionLong"].(string),
			Instructors:        instructors,
			MeetingPatterns:    meetingPatterns,
		})
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

func gqlLevel(level string) string {
	switch level {
	case "PRIMUGRD":
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
