// Functions for various casting and formatting operations.

package datasource

import "strconv"

func castAsInt(value string) uint32 {
	x, err := strconv.ParseUint(value, 10, 32)
	if err != nil {
		panic(err)
	}
	return uint32(x)
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
