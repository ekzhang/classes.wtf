// Functions for various casting and formatting operations.

package datasource

import "strconv"

var DivisionalAreas = [3]string{"Arts and Humanities", "Social Sciences", "Science & Engineering & Applied Science"}

func getGenEdInfo(intAttributes []interface{}) []string {

	// Type conversion, since we're dealing with an interface.
	var attributes []map[string]interface {}
	for _, item := range intAttributes {
		attrMap, ok := item.(map[string]interface {}) 
		if !ok {
			panic("An item in courseAttributes is not of type map[string]interface")
		}
		attributes = append(attributes, attrMap)
	}

	areas := []string{}
	for _, attribute := range attributes {
		if attribute["crseAttributeDescription"] == "FAS General Education" {
			areas = append(areas, attribute["crseAttrValueDescription"].(string))
		}
	}
	return areas // if empty, not a GENED. 
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
