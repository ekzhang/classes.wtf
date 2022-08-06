package datasource

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	_ "embed"
)

const endpoint = "https://curricle.berkman.harvard.edu/graphql"

//go:embed getCourses.gql
var query string

type GqlRequest struct {
	OperationName string                 `json:"operationName"`
	Query         string                 `json:"query"`
	Variables     map[string]interface{} `json:"variables"`
}

type GqlResponse struct {
	Data struct {
		CoursesConnection CourseData `json:"coursesConnection"`
	} `json:"data"`
}

type CourseData struct {
	TotalCount int                      `json:"totalCount"`
	Courses    []map[string]interface{} `json:"nodes"`
}

func GetCourses(keywords *string, perPage, page int) (*CourseData, error) {
	gqlReq := GqlRequest{
		OperationName: "getCourses",
		Query:         query,
		Variables: map[string]interface{}{
			"query":   keywords,
			"perPage": perPage,
			"page":    page,
		},
	}
	reqBody, err := json.Marshal(&gqlReq)
	if err != nil {
		return nil, fmt.Errorf("could not marshal request body: %v", err)
	}

	req, _ := http.NewRequest("POST", endpoint, bytes.NewBuffer(reqBody))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed graphql request: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("graphql request had bad status code: %v", resp.Status)
	}

	body, _ := io.ReadAll(resp.Body)
	gqlResp := GqlResponse{}
	if err := json.Unmarshal(body, &gqlResp); err != nil {
		return nil, fmt.Errorf("could not unmarshal response body: %v", err)
	}
	return &gqlResp.Data.CoursesConnection, nil
}
