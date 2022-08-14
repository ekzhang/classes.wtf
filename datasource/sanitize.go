// Functions for sanitizing HTML course descriptions.

package datasource

import "github.com/microcosm-cc/bluemonday"

var ugcPolicy = bluemonday.UGCPolicy()
var strictPolicy = bluemonday.StrictPolicy()

func sanitizeHtml(html string) string {
	return ugcPolicy.Sanitize(html)
}

func removeTags(html string) string {
	return strictPolicy.Sanitize(html)
}
