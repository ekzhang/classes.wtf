// Functions for various casting and formatting operations.

package datasource

import "strconv"

// Any crseAttrValue's that don't fall into these are labeled "None"
var divisionalAreas = [3]string{"A&H", "SCI", "SOC"}

func getGenEdInfo(intAttributes []any) []string {

	// Get the gen-ed areas from the course attributes.
	areas := []string{}
	for _, item := range intAttributes {
		attrMap := item.(map[string]any)
		if attrMap["crseAttribute"] == "LGE" {
			areas = append(areas, attrMap["crseAttrValue"].(string))
		}
	}
	return areas // if empty, not a GENED.
}

func checkDivisionalArea(val string) bool {
	for _, area := range divisionalAreas {
		if val == area {
			return true
		}
	}
	return false
}

func getDivisionalInfo(intAttributes []interface{}) []string {

	// Type conversion, since we're dealing with an interface.
	areas := []string{}
	for _, item := range intAttributes {
		attrMap, _ := item.(map[string]any)
		divAttr, ok := attrMap["crseAttrValue"].(string)
		if !ok {
			continue
		} // sometimes the value is nil. Just move to the next one.

		if attrMap["crseAttribute"] == "LDD" && checkDivisionalArea(divAttr) {
			areas = append(areas, divAttr)
		}
	}
	return areas // if empty, no divisional distributions.
}

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
