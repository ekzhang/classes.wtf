package datasource

// JSON object that specifies a course row.
type Course struct {
	// Id is a unique, alphanumeric identifier for the course in some format.
	Id string `json:"id"`

	// ExternalId is a non-unique ID used by My.Harvard and syllabus search.
	ExternalId uint32 `json:"externalId"`

	// QGuideId is the ID used by the old Harvard Q guide, or 0 if not available.
	QGuideId uint32 `json:"qGuideId"`

	// Title is the name of the course.
	Title string `json:"title"`

	// Subject is the abbreviated subject code (COMPSCI, HIST-SCI, etc.).
	Subject string `json:"subject"`

	// SubjectDescription is the full description of the subject.
	SubjectDescription string `json:"subjectDescription"`

	// CatalogNumber is the course number (e.g. "101").
	CatalogNumber string `json:"catalogNumber"`

	// Level is the course level ("Intro", "Undergrad", or "Graduate").
	Level string `json:"level"`

	// AcademicGroup describes the school offering the course (FAS, GSAS).
	AcademicGroup string `json:"academicGroup"`

	// Semester is the semester offered ("Spring 2021", "Summer 2019").
	Semester string `json:"semester"`

	// AcademicYear is the school year corresponding to the semester.
	AcademicYear uint32 `json:"academicYear"`

	// ClassSection is a number distinguishing between sections of the same course.
	ClassSection string `json:"classSection"`

	// Component describes the type of course (Studio, Lecture).
	Component string `json:"component"`

	// Description is the human-readable long form HTML text of the course.
	Description string `json:"description"`

	// Instructors describes each instructor in the course.
	Instructors []Instructor `json:"instructors"`

	// MeetingPatterns describes the course's meeting times.
	MeetingPatterns []MeetingPattern `json:"meetingPatterns"`
}

// Instructor describes a faculty course instructor.
type Instructor struct {
	// Name is the full name of the instructor.
	Name string `json:"name"`

	// Email is the instructor's email, if available (otherwise empty).
	Email string `json:"email"`
}

// MeetingPattern is a single regular meeting time schedule.
type MeetingPattern struct {
	StartTime        string `json:"startTime"`
	EndTime          string `json:"endTime"`
	StartDate        string `json:"startDate"`
	EndDate          string `json:"endDate"`
	MeetsOnMonday    bool   `json:"meetsOnMonday"`
	MeetsOnTuesday   bool   `json:"meetsOnTuesday"`
	MeetsOnWednesday bool   `json:"meetsOnWednesday"`
	MeetsOnThursday  bool   `json:"meetsOnThursday"`
	MeetsOnFriday    bool   `json:"meetsOnFriday"`
	MeetsOnSaturday  bool   `json:"meetsOnSaturday"`
	MeetsOnSunday    bool   `json:"meetsOnSunday"`
}
