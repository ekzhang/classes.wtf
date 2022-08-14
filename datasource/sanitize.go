// Functions for sanitizing HTML course descriptions.

package datasource

import (
	"html"

	"github.com/microcosm-cc/bluemonday"
)

var ugcPolicy = bluemonday.UGCPolicy()
var strictPolicy = bluemonday.StrictPolicy()

func sanitizeHtml(content string) string {
	return ugcPolicy.Sanitize(content)
}

func removeTags(content string) string {
	return html.UnescapeString(strictPolicy.Sanitize(content))
}
